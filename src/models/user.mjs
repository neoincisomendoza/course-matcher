import { Model, ValidationError } from 'objection'
import bcrypt from 'bcryptjs'

export class User extends Model {
    static get tableName() {
        return 'users'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const Group = require('./group')
        const Privilege = require('./privilege')
        const Response = require('./response')
        return {
            groups: {
                relation: Model.ManyToManyRelation,
                modelClass: Group,
                join: {
                    from: 'users.id',
                    through: {
                        from: 'users_groups.user_id',
                        to: 'users_groups.group_id',
                    },
                    to: 'groups.id',
                },
            },
            privileges: {
                relation: Model.ManyToManyRelation,
                modelClass: Privilege,
                join: {
                    from: 'users.id',
                    through: {
                        from: 'users_privileges.user_id',
                        to: 'users_privileges.privilege_id',
                    },
                    to: 'privileges.id',
                },
            },
            responses: {
                relation: Model.HasManyRelation,
                modelClass: Response,
                join: {
                    from: 'users.id',
                    to: 'responses.user_id',
                },
            },
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['email', 'name', 'hashed_password', 'state'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                email: { type: 'string', format: 'email', minLength: 1 },
                name: { type: 'string', minLength: 1 },
                hashed_password: { type: 'string' },
            },
        }
    }

    async $beforeInsert() {
        this.created_at = new Date()
        await this.ensureUniqueEmail()
        if (this.password) {
            this.hashed_password = await bcrypt.hash(this.password, 10)
            delete this.password
        }
    }

    async $beforeUpdate() {
        await this.ensureUniqueEmail()
        if (this.password) {
            this.hashed_password = await bcrypt.hash(this.password, 10)
            delete this.password
        }
    }

    async ensureUniqueEmail() {
        const existing = await User.query()
            .where('email', this.email)
            .whereNot('id', this.id || null)
            .first()
        if (existing) {
            throw new ValidationError({
                message: 'Email must be unique',
                type: 'ModelValidation',
                data: { email: this.email }
            })
        }
    }

    toJSONSummary() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
        }
    }
}
