import { Model, ValidationError } from 'objection'

export class Response extends Model {
    static get tableName() {
        return 'responses'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const Field = require('./field')
        const User = require('./user')
        return {
            field: {
                relation: Model.BelongsToOneRelation,
                modelClass: Field,
                join: {
                    from: 'responses.field_id',
                    to: 'fields.id',
                },
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'responses.user_id',
                    to: 'users.id',
                },
            },
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['slug', 'name', 'description', 'data', 'field_id', 'user_id'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                slug: { type: 'string', minLength: 1 },
                name: { type: 'string' },
                description: { type: 'string' },
                data: { type: 'object' },
                field_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
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
        const existing = await Response.query()
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
            field_id: this.field_id,
            user_id: this.user_id,
        }
    }
}
