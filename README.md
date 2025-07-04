# Bi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


# Дополнительные запросы

```
create view dbfields_booking as
select 
  table_name, 
  column_name, 
  data_type, 
  character_maximum_length, 
  numeric_precision, 
  numeric_scale 
from information_schema.columns
where table_schema = 'booking'
order by table_name, ordinal_position;
```

```
create view dbtables_bookings as
select table_schema, table_name
from information_schema.tables
where table_schema = 'bookings'
order by table_name;
```

```
DROP TABLE IF EXISTS chart CASCADE;
```

```
CREATE TABLE chart (
    id UUID PRIMARY KEY,
    name TEXT,
    x_axis TEXT,
    y_axis TEXT[],
    filters JSONB,
    group_by TEXT,
    settings JSONB,
    dataSet_id UUID,
    FOREIGN KEY (dataSet_id) REFERENCES "dataSet"(id) ON DELETE CASCADE
)
```

```
CREATE TABLE widget (
    id UUID PRIMARY KEY,
    dashboard_id UUID NOT NULL,
    chart_id UUID,            
    position TEXT,           
    title TEXT,
    type TEXT NOT NULL,      
    visual_settings JSONB,    

    FOREIGN KEY (dashboard_id) REFERENCES dashboard(id) ON DELETE CASCADE,
    FOREIGN KEY (chart_id) REFERENCES chart(id) ON DELETE SET NULL
);
```
