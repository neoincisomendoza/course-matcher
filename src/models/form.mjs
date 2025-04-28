import { Model, JSONSchema, ValidationError } from 'objection'

export class Form extends Model {
    static get tableName() {
        return 'forms'
    }

    static get idColumn() {
        return 'id'
    }

    static get relationMappings() {
        const { Field } = require('./field')
        return {
            fields: {
                relation: Model.ManyToManyRelation,
                modelClass: Field,
                join: {
                    from: 'forms.id',
                    through: {
                        from: 'forms_fields.form_id',
                        to: 'forms_fields.field_id',
                    },
                    to: 'fields.id',
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
        const existing = await Form.query()
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