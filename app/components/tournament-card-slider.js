import Ember from 'ember';
import limitCalls from '../utils/limit-calls';
import ControllableInterval from '../utils/controllable-interval';

/*

autoScroll          -> automatically scrolls at the given interval, default false
slideInterval       -> slider moves next card at this interval, default 5000ms (5 seconds)

sliderWindowSize    -> no of cards dispalyed in slider
autoFit             -> automatically assigns no of cards based on container size
maxSliderWindowSize -> used with autoFit to limit max no of cards per slider


*/

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['tournament-card-slider'],
    parentWidth: null,
    windowResizeListener: null,
    autoSliderWindowSize : Ember.computed('parentWidth', function() {
        const parentWidth = this.get('parentWidth');
        return Math.max(1, Math.floor((parentWidth - (8.75 * 16)) / (20 * 16)));
    }),


    autoScrollInterval: null,

    didInsertElement() {
        this._super(...arguments);

        const $sliderParent = $(this.element).parent();
        
        if(this.get('autoFit') === true){
            this.windowResizeListener = limitCalls(100, () => {
                this.set('parentWidth', $sliderParent.width());
            });
            window.addEventListener('resize', this.windowResizeListener);
            this.set('parentWidth', $sliderParent.width());
        }

        this.setupSlider();
    },

    willDestroyElement() {
        this._super(...arguments);
        if(this.get('autoFit') === true){
            window.removeEventListener('resize', this.windowResizeListener);
        }

        if(this.get('automaticScroll') === true){
            this.autoScrollInterval.stop();
        }
    },

    autoFitObserver: Ember.observer('autoSliderWindowSize', function(){
        this.setupSlider();
    }),

    setupSlider(){
        const sliderWindowSize = this.get('autoFit')? this.get('maxSliderWindowSize')? Math.min(this.get('maxSliderWindowSize'), this.get('autoSliderWindowSize')) : this.get('autoSliderWindowSize') : this.get('sliderWindowSize');

        const $slider = $(this.element);
        const $sliderWrapper = $slider.find('div.tournament-card-slider-wrapper').eq(0);
        const $sliderCards = $sliderWrapper.find('div.tournament-card');

        $sliderWrapper.css('width', `${(sliderWindowSize * 17) + 1}rem`)

        const handleScroll = () => {
            const currentIndex = this.get('currentIndex');
            let scrollWidth = 16;
            for(let i=0; i<currentIndex; i++){
                scrollWidth += ($sliderCards.eq(i).width() + 16);
            }
            $sliderWrapper.scrollLeft(scrollWidth)
        };

        if(this.get('automaticScroll') === true){
            const slideInterval = this.get('slideInterval') || 5000;
            if(this.autoScrollInterval !== null){
                this.autoScrollInterval.stop();
            }
            this.autoScrollInterval = new ControllableInterval(() => {
                const currentIndex = this.get('currentIndex');
                const totalCards = this.get('totalCards');
                this.set('currentIndex', (currentIndex + 1) % (totalCards - sliderWindowSize + 1));
                handleScroll();
            }, slideInterval);
            this.autoScrollInterval.start();
            if(this.get('pauseOnHover') === true){
                $slider.on('mouseenter', () => {
                    this.autoScrollInterval.pause();
                });
    
                $slider.on('mouseleave', () => {
                    this.autoScrollInterval.resume();
                });
            }
        }
        
        this.set('handleScroll', handleScroll);
    },

    tournaments: [],
    totalCards: Ember.computed('tournaments', function() {
        return this.get('tournaments').length;
    }),
    currentIndex: 0,
    sliderWindowSize: 4,
    actions: {
        slideRight(){
            const totalCards = this.get('totalCards');
            const currentIndex = this.get('currentIndex');
            const sliderWindowSize = this.get('autoFit')? this.get('maxSliderWindowSize')? Math.min(this.get('maxSliderWindowSize'), this.get('autoSliderWindowSize')) : this.get('autoSliderWindowSize') : this.get('sliderWindowSize');
            this.set('currentIndex', (totalCards - sliderWindowSize + currentIndex - 1) % (totalCards - sliderWindowSize + 1));
            this.get('handleScroll')();
        },
        slideLeft(){
            const totalCards = this.get('totalCards');
            const currentIndex = this.get('currentIndex');
            const sliderWindowSize = this.get('autoFit')? this.get('maxSliderWindowSize')? Math.min(this.get('maxSliderWindowSize'), this.get('autoSliderWindowSize')) : this.get('autoSliderWindowSize') : this.get('sliderWindowSize');
            this.set('currentIndex', (currentIndex + 1) % (totalCards - sliderWindowSize + 1));
            this.get('handleScroll')();
        }
    }
});
 