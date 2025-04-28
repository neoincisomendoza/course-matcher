import { Model, ValidationError } from 'objection'

export class Privilege extends Model {
    static get tableName() {
        return 'privileges'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const Scope = require('./scope')
        const User = require('./user')
        const Group = require('./group')
        return {
            scope: {
                relation: Model.BelongsToOneRelation,
                modelClass: Scope,
                join: {
                    from: 'privileges.scope_id',
                    to: 'scopes.id',
                },
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'privileges.id',
                    through: {
                        from: 'users_privileges.privilege_id',
                        to: 'users_privileges.user_id',
                    },
                    to: 'users.id',
                },
            },
            groups: {
                relation: Model.ManyToManyRelation,
                modelClass: Group,
                join: {
                    from: 'privileges.id',
                    through: {
                        from: 'groups_privileges.privilege_id',
                        to: 'groups_privileges.group_id',
                    },
                    to: 'groups.id',
                },
            },
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['slug', 'name', 'description', 'type', 'scope_id'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                slug: { type: 'string', minLength: 1 },
                name: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                scope_id: { type: 'string', format: 'uuid' },
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
        const existing = await Privilege.query()
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
            id: this.id,
            slug: this.slug,
            name: this.name,
            description: this.description,
            type: this.type,
            scope_id: this.scope_id,
        }
    }
}
