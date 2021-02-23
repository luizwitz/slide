import debounce from "./debounce.js";

export class Slide {
    constructor(slide, wrapper) {
        this.slide = document.querySelector(slide);
        this.wrapper = document.querySelector(wrapper);
        this.activeClass = "active";
        this.distance = {
            finalPosition: 0,
            startX: 0,
            movement: 0,
        };
    }

    transition(active) {
        this.slide.style.transition = active ? "transform 0.3s" : "";
    }

    moveSlide(distX) {
        this.distance.movePosition = distX;
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
    }

    updatePosition(clientX) {
        this.distance.movement = (this.distance.startX - clientX) * 1.6;
        return this.distance.finalPosition - this.distance.movement;
    }

    onStart(event) {
        let movetype;
        if (event.type === "mousedown") {
            event.preventDefault();
            this.distance.startX = event.clientX;
            movetype = "mousemove";
        } else {
            this.distance.startX = event.changedTouches[0].clientX;
            movetype = "touchmove";
        }
        this.wrapper.addEventListener(movetype, this.onMove);
        this.transition(false);
    }

    onMove(event) {
        const pointerPosition =
            event.type === "mousemove"
                ? event.clientX
                : event.changedTouches[0].clientX;
        const finalPosition = this.updatePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    onEnd(event) {
        const movetype = event.type === "mouseup" ? "mousemove" : "touchmove";
        this.wrapper.removeEventListener(movetype, this.onMove);
        this.distance.finalPosition = this.distance.movePosition;
        this.transition(true);
        this.changeSlideOnEnd();
    }

    changeSlideOnEnd() {
        if (this.distance.movement > 120 && this.index.next !== undefined) {
            this.activeNextSlide();
        } else if (
            this.distance.movement < -120 &&
            this.index.previous !== undefined
        ) {
            this.activePrevSlide();
        } else {
            this.changeSlide(this.index.active);
        }
    }

    addSlideEvents() {
        this.wrapper.addEventListener("mousedown", this.onStart);
        this.wrapper.addEventListener("touchstart", this.onStart);
        this.wrapper.addEventListener("mouseup", this.onEnd);
        this.wrapper.addEventListener("touchend", this.onEnd);
    }

    // Slides config.

    slidePosition(slide) {
        const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
        return -(slide.offsetLeft - margin);
    }

    slidesConfig() {
        this.slideArray = [...this.slide.children].map((element) => {
            const position = this.slidePosition(element);
            return {
                position,
                element,
            };
        });
    }

    slidesIndexNav(index) {
        const last = this.slideArray.length - 1;
        this.index = {
            previous: index ? index - 1 : undefined,
            active: index,
            next: index === last ? undefined : index + 1,
        };
    }

    changeSlide(index) {
        const activeSlide = this.slideArray[index];
        this.moveSlide(activeSlide.position);
        this.slidesIndexNav(index);
        this.distance.finalPosition = activeSlide.position;
        this.changeActiveClass();
    }

    changeActiveClass() {
        this.slideArray.forEach((item) => {
            item.element.classList.remove(this.activeClass);
        });
        this.slideArray[this.index.active].element.classList.add(
            this.activeClass
        );
    }

    activePrevSlide() {
        if (this.index.previous !== undefined)
            this.changeSlide(this.index.previous);
    }

    activeNextSlide() {
        if (this.index.next !== undefined) this.changeSlide(this.index.next);
    }

    onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changeSlide(this.index.active);
        }, 1000);
    }

    addResizeEvent() {
        window.addEventListener("resize", this.onResize);
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);
        this.onResize = debounce(this.onResize.bind(this), 200);
    }

    init() {
        this.bindEvents();
        this.transition(true);
        this.addSlideEvents();
        this.slidesConfig();
        this.addResizeEvent();
        this.changeSlide(2);
        return this;
    }
}

export class SlideNav extends Slide {
    addArrow(previous, next) {
        this.previousElement = document.querySelector(previous);
        this.nextElement = document.querySelector(next);
        this.addArrowEvent();
    }

    addArrowEvent() {
        this.previousElement.addEventListener("click", this.activePrevSlide);
        this.nextElement.addEventListener("click", this.activeNextSlide);
    }
}
