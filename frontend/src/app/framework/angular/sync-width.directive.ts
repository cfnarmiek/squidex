/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { ResizeListener, ResizeService, Subscriptions } from '@app/framework/internal';

@Directive({
    selector: '[sqxSyncWidth]',
})
export class SyncWidthDirective implements AfterViewInit, ResizeListener {
    private readonly subscriptions = new Subscriptions();

    @Input('sqxSyncWidth')
    public target!: HTMLElement;

    constructor(
        private readonly element: ElementRef<HTMLElement>,
        private readonly renderer: Renderer2,
        private readonly resizeService: ResizeService,
    ) {
        this.subscriptions.add(this.resizeService.listen(this.element.nativeElement, this));
    }

    public ngAfterViewInit() {
        this.onReposition();
    }

    public onResize(size: DOMRect) {
        this.resize(size.width);
    }

    private onReposition() {
        this.resize(this.element.nativeElement.clientWidth);
    }

    private resize(width: number) {
        if (this.target) {
            this.renderer.setStyle(this.target, 'width', `${width}px`);
        }
    }
}
