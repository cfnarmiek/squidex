/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { Component, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppsState, getCategoryTree, SchemaCategory, SchemasState, Settings, UIOptions, value$ } from '@app/shared';

@Component({
    selector: 'sqx-schemas-page',
    styleUrls: ['./schemas-page.component.scss'],
    templateUrl: './schemas-page.component.html',
})
export class SchemasPageComponent {
    public schemasFilter = new UntypedFormControl();

    public readonly isEmbedded = inject(UIOptions).value.embedded;

    public schemas =
        this.schemasState.schemas.pipe(
            map(schemas => {
                const app = this.appsState.snapshot.selectedApp!;

                return schemas.filter(schema =>
                    schema.canReadContents &&
                    schema.isPublished &&
                    schema.type !== 'Component' &&
                    !app.roleProperties[Settings.AppProperties.HIDE_CONTENTS(schema.name)],
                );
            }));

    public categories =
        combineLatest([
            value$(this.schemasFilter),
            this.schemas,
            this.schemasState.addedCategories,
        ], (filter, schemas, categories) => {
            return getCategoryTree(schemas, categories, filter);
        });

    constructor(
        public readonly schemasState: SchemasState,
        private readonly appsState: AppsState,
    ) {
    }

    public trackByCategory(_index: number, category: SchemaCategory) {
        return category.name;
    }
}
