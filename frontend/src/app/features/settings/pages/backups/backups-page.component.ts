/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiUrlConfig, BackupDto, BackupsState, Subscriptions } from '@app/shared';

@Component({
    selector: 'sqx-backups-page',
    styleUrls: ['./backups-page.component.scss'],
    templateUrl: './backups-page.component.html',
})
export class BackupsPageComponent implements OnInit {
    private readonly subscriptions = new Subscriptions();

    constructor(
        public readonly apiUrl: ApiUrlConfig,
        public readonly backupsState: BackupsState,
    ) {
    }

    public ngOnInit() {
        this.backupsState.load(true);

        this.subscriptions.add(timer(3000, 3000).pipe(switchMap(() => this.backupsState.load(false, true))));
    }

    public reload() {
        this.backupsState.load(true, false);
    }

    public start() {
        this.backupsState.start();
    }

    public trackByBackup(_index: number, item: BackupDto) {
        return item.id;
    }
}
