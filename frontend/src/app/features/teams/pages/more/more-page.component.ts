/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { Component, OnInit } from '@angular/core';
import { defined, Subscriptions, TeamDto, TeamsState, UpdateTeamForm } from '@app/shared';

@Component({
    selector: 'sqx-more-page',
    styleUrls: ['./more-page.component.scss'],
    templateUrl: './more-page.component.html',
})
export class MorePageComponent implements OnInit {
    private readonly subscriptions = new Subscriptions();

    public team!: TeamDto;

    public isEditable = false;

    public updateForm = new UpdateTeamForm();

    constructor(
        private readonly teamsState: TeamsState,
    ) {
    }

    public ngOnInit() {
        this.subscriptions.add(
            this.teamsState.selectedTeam.pipe(defined())
                .subscribe(team => {
                    this.team = team;

                    this.isEditable = team.canUpdateGeneral;

                    this.updateForm.load(team);
                    this.updateForm.setEnabled(this.isEditable);
                }));

        this.teamsState.reloadTeams();
    }

    public save() {
        if (!this.isEditable) {
            return;
        }

        const value = this.updateForm.submit();

        if (value) {
            this.teamsState.update(this.team, value)
                .subscribe({
                    next: team => {
                        this.updateForm.submitCompleted({ newValue: team });
                    },
                    error: error => {
                        this.updateForm.submitFailed(error);
                    },
                });
        }
    }
}
