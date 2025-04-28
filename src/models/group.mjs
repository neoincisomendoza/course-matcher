import { Model, JSONSchema, ValidationError } from 'objection'

export class Group extends Model {
    static get tableName() {
        return 'groups'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const { User } = require('./user')
        const { Privilege } = require('./privilege')
        return {
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'groups.id',
                    through: {
                        from: 'users_groups.group_id',
                        to: 'users_groups.user_id',
                    },
                    to: 'users.id',
                },
            },
            privileges: {
                relation: Model.ManyToManyRelation,
                modelClass: Privilege,
                join: {
                    from: 'groups.id',
                    through: {
                        from: 'groups_privileges.group_id',
                        to: 'groups_privileges.privilege_id',
                    },
                    to: 'privileges.id',
                },
            },
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['slug', 'name', 'description'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                slug: { type: 'string', minLength: 1 },
                name: { type: 'string' },
                description: { type: 'string' },
            },
        }
    }

    async $beforeInsert() {
        this.created_at = new Date()
        await this.ensureUniqueSlug()
    }

    async $beforeUpdate() {
        await this.ensureUniqueSlug()
    }

    async ensureUniqueSlug() {
        const existing = await Group.query()
            .where('slug', this.slug)
            .whereNot('id', this.id || null)
            .first()
        if (existing) {
            throw new ValidationError({
                message: 'Slug must be unique',
                type: 'ModelValidation',
                data: { slug: this.slug }
            })
        }
    }

    toJSONSummary() {
        return {
            slug: this.slug,
            name: this.name,
            description: this.description,
        }
    }
}
