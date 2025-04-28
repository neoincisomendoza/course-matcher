import { Model, JSONSchema, ValidationError } from 'objection'

export class Field extends Model {
    static get tableName() {
        return 'fields'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const { Form } = require('./form')
        const { Response } = require('./response')
        return {
            forms: {
                relation: Model.ManyToManyRelation,
                modelClass: Form,
                join: {
                    from: 'fields.id',
                    through: {
                        from: 'forms_fields.field_id',
                        to: 'forms_fields.form_id',
                    },
                    to: 'forms.id',
                },
            },
            responses: {
                relation: Model.HasManyRelation,
                modelClass: Response,
                join: {
                    from: 'fields.id',
                    to: 'responses.field_id',
                },
            },
        }
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['slug'],
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
        const existing = await Field.query()
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