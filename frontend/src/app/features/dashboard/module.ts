/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridsterModule } from 'angular-gridster2';
import { NgChartsModule } from 'ng2-charts';
import { SqxFrameworkModule, SqxSharedModule } from '@app/shared';
import { ApiCardComponent, ContentSummaryCardComponent, DashboardConfigComponent, DashboardPageComponent, GithubCardComponent, HistoryCardComponent, SchemaCardComponent } from './declarations';

const routes: Routes = [
    {
        path: '',
        component: DashboardPageComponent,
    },
];

@NgModule({
    imports: [
        GridsterModule,
        NgChartsModule,
        RouterModule.forChild(routes),
        SqxFrameworkModule,
        SqxSharedModule,
    ],
    declarations: [
        ApiCardComponent,
        ContentSummaryCardComponent,
        DashboardConfigComponent,
        DashboardPageComponent,
        GithubCardComponent,
        HistoryCardComponent,
        SchemaCardComponent,
    ],
})
export class SqxFeatureDashboardModule {}
