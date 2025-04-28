import { Model, ValidationError } from 'objection'

export class Scope extends Model {
    static get tableName() {
        return 'scopes'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const Privilege = require('./privilege')
        return {
            privileges: {
                relation: Model.HasManyRelation,
                modelClass: Privilege,
                join: {
                    from: 'scopes.id',
                    to: 'privileges.scope_id',
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
        const existing = await Scope.query()
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
        }
    }
}
