/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UpsertUserDto, UserDto, UserForm, UsersState } from '@app/features/administration/internal';
import { Subscriptions } from '@app/shared';

@Component({
    selector: 'sqx-user-page',
    styleUrls: ['./user-page.component.scss'],
    templateUrl: './user-page.component.html',
})
export class UserPageComponent implements OnInit {
    private readonly subscriptions = new Subscriptions();

    public isEditable = false;

    public user?: UserDto | null;
    public userForm = new UserForm();

    constructor(
        public readonly usersState: UsersState,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {
    }

    public ngOnInit() {
        this.subscriptions.add(
            this.usersState.selectedUser
                .subscribe(user => {
                    this.user = user;

                    this.isEditable = !user || user.canUpdate;

                    const permissions: string[] = [];

                    this.userForm.load(user || { permissions });
                    this.userForm.setEnabled(this.isEditable);
                }));
    }

    public save() {
        if (!this.isEditable) {
            return;
        }

        const value = this.userForm.submit();

        if (value) {
            if (this.user) {
                this.usersState.update(this.user, value)
                    .subscribe({
                        next: user => {
                            this.userForm.submitCompleted({ newValue: user });
                        },
                        error: error => {
                            this.userForm.submitFailed(error);
                        },
                    });
            } else {
                this.usersState.create(<UpsertUserDto>value)
                    .subscribe({
                        next: () => {
                            this.back();
                        },
                        error: error => {
                            this.userForm.submitFailed(error);
                        },
                    });
            }
        }
    }

    private back() {
        this.router.navigate(['../'], { relativeTo: this.route, replaceUrl: true });
    }
}
