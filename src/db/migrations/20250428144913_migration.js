/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Enable uuid-ossp extension for UUID generation
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Table: scopes
  await knex.schema.createTable('scopes', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
  });

  // Table: privileges
  await knex.schema.createTable('privileges', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
    table.string('type');
    table.uuid('scope_id').references('id').inTable('scopes').onDelete('CASCADE');
  });

  // Table: groups
  await knex.schema.createTable('groups', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
  });

  // Table: users
  await knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('hashed_password').notNullable();
  });

  // Table: fields
  await knex.schema.createTable('fields', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
  });

  // Table: forms
  await knex.schema.createTable('forms', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
  });

  // Table: responses
  await knex.schema.createTable('responses', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('slug').notNullable().unique();
    table.string('name');
    table.string('description');
    table.jsonb('data');
    table.uuid('field_id').notNullable().references('id').inTable('fields').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
  });

  // Join tables
  await knex.schema.createTable('users_groups', table => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('group_id').notNullable().references('id').inTable('groups').onDelete('CASCADE');
    table.primary(['user_id', 'group_id']);
  });

  await knex.schema.createTable('users_privileges', table => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('privilege_id').notNullable().references('id').inTable('privileges').onDelete('CASCADE');
    table.primary(['user_id', 'privilege_id']);
  });

  await knex.schema.createTable('groups_privileges', table => {
    table.uuid('group_id').notNullable().references('id').inTable('groups').onDelete('CASCADE');
    table.uuid('privilege_id').notNullable().references('id').inTable('privileges').onDelete('CASCADE');
    table.primary(['group_id', 'privilege_id']);
  });

  await knex.schema.createTable('forms_fields', table => {
    table.uuid('form_id').notNullable().references('id').inTable('forms').onDelete('CASCADE');
    table.uuid('field_id').notNullable().references('id').inTable('fields').onDelete('CASCADE');
    table.primary(['form_id', 'field_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('forms_fields');
  await knex.schema.dropTableIfExists('groups_privileges');
  await knex.schema.dropTableIfExists('users_privileges');
  await knex.schema.dropTableIfExists('users_groups');
  await knex.schema.dropTableIfExists('responses');
  await knex.schema.dropTableIfExists('forms');
  await knex.schema.dropTableIfExists('fields');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('groups');
  await knex.schema.dropTableIfExists('privileges');
  await knex.schema.dropTableIfExists('scopes');
};
