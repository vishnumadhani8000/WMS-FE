import { Directive, Input, ElementRef, HostListener, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class Tooltip implements OnDestroy {
  @Input('appTooltip') text = '';

  private tooltipEl: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener('mouseenter') onEnter() {
    const el = this.el.nativeElement;
    const isOverflowing = el.offsetWidth < el.scrollWidth;

    // show if explicit text passed OR element is visually truncated
    // if (!this.text && !isOverflowing) return;

    // const textToShow = this.text || el.innerText;
    // if (!textToShow) return;

    // this.showWithText(textToShow);

    if (this.text) {
      this.showWithText(this.text);
    } else if (isOverflowing) {
      const textToShow = el.innerText;
      if (textToShow) {
        this.showWithText(textToShow);
      }
    }
  }

  @HostListener('mouseleave') onLeave() {
    this.hide();
  }

  private showWithText(text: string): void {
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'app-tooltip');
    this.renderer.setProperty(this.tooltipEl, 'innerText', text);
    this.renderer.appendChild(document.body, this.tooltipEl);

    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltip = this.tooltipEl!;

    requestAnimationFrame(() => {
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      const gap = 12;

      const spaceOnTop = rect.top;
      const openDown = spaceOnTop < th + gap;

      const top = openDown
        ? rect.bottom + window.scrollY + gap
        : rect.top + window.scrollY - th - gap;

      const left = Math.max(
        8,
        Math.min(
          rect.left + window.scrollX + rect.width / 2 - tw / 2,
          window.innerWidth - tw - 8, // prevent going off screen right
        ),
      );

      this.renderer.setStyle(tooltip, 'top', `${top}px`);
      this.renderer.setStyle(tooltip, 'left', `${left}px`);
      this.renderer.setAttribute(tooltip, 'data-position', openDown ? 'bottom' : 'top');
      this.renderer.addClass(tooltip, 'visible');
    });
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
