/* based on jOdometer by Jesus Carrera 
   improved and implemented with text/CSS instead of images by Brian Mortenson 2012.06.25
   */
/*
* jOdometer (1.2) // 2012.02.14 // <http://www.frontendmatters.com/projects/jquery-plugins/jodometer/>
* 
* REQUIRES jQuery 1.2.3+ <http://jquery.com/>
* 
* Copyright (c) 2008 TrafficBroker <http://www.trafficbroker.co.uk>
* Licensed under GPL and MIT licenses
* 
* jOdometer is a counter that works like an odometer: moving the numbers up like a wheel 
*
* Usually we will need a "position: relative" and an "overflow: hidden" in the container element.
*
* Sample Configuration:
* $('.counter').jOdometer({increment: 3.17, counterStart:'0087.15', counterEnd:'0159.50', numbersImage: '/images/numbers.png', spaceNumbers: 2, offsetRight:5});
* 
* Config Options:
* counterStart: Number we are starting with. To get a specific number of digits/decimals it have to be a string (e.g. '0005.50') // Default: '0000.00'
* counterEnd: The counter stop when reach this number. If it is the same as counterStart the odometer is static. False to don't stop never. // Default: false
* delayTime: Delay between each number change // Default: 1000
* increment: Number increment after each delayTime // Default: 0.01
* speed: Speed for the change number animation // Default: 500
* easing: Easing for the change number animation. Other than 'swing' or 'linear' must be provided by plugin // Default: 'swing'
* numbersImage: Image used for the numbers. You can use .psd provided // Default: '/images/numbers.png'
* heightNumber: The height that each number needs // Default: 31
* widthNumber: Width of the numbers' image // Default: 14
* offsetRight: Distance to the right // Default: 0
* spaceNumbers: Separation between the numbers' columns // Default: 0
* widthDot: Decimal dot's special width // Default: 10
* formatNumber: Whether to format the number with commas every 3 digits // Default: false
* 
* We can override the defaults with:
* $.fn.jOdometer.defaults.spaceNumbers = 1;

* It returns an object used for counter manipulation. Available Functions:
* goToNumber(number): Updates the counter with the number given. Example:
* var counter = $('.counter').jOdometer({...});
* counter.goToNumber(100);
* 
* @param  settings  An object with configuration options
* @author    Jesus Carrera <jesus.carrera@frontendmatters.com>
*
* Credits:
* Tom Fotherby (added comma formatting) <https://github.com/tomfotherby>
*/
(function($) {
    $.fn.jOdometer = function(settings) {

        if (this.length > 1) {
            this.each(function() {
                $(this).jOdometer(settings)
            });
            return this;
        }

        // override default configuration
        settings = $.extend({}, $.fn.jOdometer.defaults, settings);

        this.goToNumber = function(newCounter) {
            advanceCounter(newCounter);
        };

        // for each counter
        // return this.each(function(){
        var $this = $(this);

        $this.empty();
        
        var zeroSet = -settings.heightNumber; // position of the first 0
        var counter = parseFloat(settings.counterStart); // initialize counter with the start number
        // to store the digits of the number
        var integersArray = [];
        var decimalsArray = [];
        var digits = String(settings.counterStart).split('.'); // separate integers and decimals
        var numberOfDecimals = 0;
        var widthDot = 0;
        var counterText = '9012345678901';
        counterText = '<div>' + counterText.split('').join('</div><div>') + '</div>';
        
        var right = settings.offsetRight;
        
        // if has decimals
        if (digits[1]) {
            // create a column for each decimal digit with the image in the position of the correspondent number
            var j = 0;
            for (var i = digits[1].length - 1; i > -1; i--) {
                decimalsArray[i] = digits[1].charAt(i);
                
                $this.append('<div style="right:' + right + 'px; top:' + ((parseInt(decimalsArray[i]) * settings.heightNumber * -1) + zeroSet) + 'px;" class="jodometer_digit jodometer_decimal_' + i + '" >' + counterText + '</div>');
                j++;
                
                right += settings.widthNumber + settings.spaceNumbers;
            }
            // add the dot (use background div so can be different width)
            $this.append('<div style="right:' + right + 'px;" class="jodometer_dot">.</div>');
            numberOfDecimals = digits[1].length;
            widthDot = settings.widthDot;
            
            right += widthDot + settings.spaceNumbers;
        }
        
        // create a column for each integer digit with the image in the position of the correspondent number
        var integers = digits[0];
        var j = integers.length - 1;

        var firstDigit = 0,
            hideDigit = '';
        if(settings.trimZero){
            var firstDigit = integers.search(/[1-9]/);
            if (firstDigit == -1) firstDigit = integers.length - 1;
        }

        for (var i = 0; i < integers.length; i++) {
            integersArray[i] = integers.charAt(j);
            
            if (j < firstDigit && settings.trimZero){
                hideDigit = 'display: none; ';
            }

            // Insert comma if wanted (helps make large numbers more readable)
            if (settings.formatNumber && i > 0 && i % 3 == 0) {
                $this.append('<div style="right:' + right + 'px; ' + hideDigit + '" class="jodometer_dot">,</div>');
                //commaExtraWidth += settings.widthDot + settings.spaceNumbers;
                right += settings.widthDot + settings.spaceNumbers;
            }

            $this.append('<div style="right:' + right + 'px; top:' + ((parseInt(integersArray[i]) * settings.heightNumber * -1) + zeroSet) + 'px; ' + hideDigit + '" class="jodometer_digit jodometer_integer_' + i + '" >' + counterText + '</div>');

            right += settings.widthNumber + settings.spaceNumbers;
            j--;
        }
        // add the interval
        if (settings.increment && (parseFloat(settings.counterStart) != settings.counterEnd || (settings.counterEnd.toString() == 'false' && parseFloat(settings.counterStart) == 0))) {
            var counterInterval = setInterval(function() {
                advanceCounter();
            }, settings.delayTime);
        }
        
        //style the elements
        $this.css({
            'height': settings.heightNumber + 'px',
            'overflow': 'hidden',
            'position': 'relative'
        });
        $this.find('.jodometer_digit').css({
            'position': 'absolute',
            'width': settings.widthNumber + 'px',
            'line-height': settings.heightNumber + 'px'
        })
        .find('div').height(settings.heightNumber);
        $this.find('.jodometer_dot').css({
            'position': 'absolute',
            'width': settings.widthDot + 'px',
            'line-height': settings.heightNumber + 'px'
        });

        // set the number increments
        function advanceCounter(newCounter) {
            if (newCounter != undefined) {
                clearInterval(counterInterval);
                counter = newCounter;
                setNumbers(counter);
            } else {
                setNumbers(counter);
                counter = counter + settings.increment; // increment the number    
            }
            // setNumbers(counter);
            // if we reach the end clear the interval and use the ending number
            if (settings.counterEnd != false && counter >= settings.counterEnd) {
                clearInterval(counterInterval);
                setNumbers(settings.counterEnd);
            }
        }

        // to move the colums from one number position to another


        function setNumbers(counter) {
            digits = String(counter).split('.'); // check decimals
            // if we where using decimals
            if (decimalsArray.length > 0) {
                // for each decimal digit, update the old digit position to the new
                for (i = 0; i < decimalsArray.length; i++) {
                    oldDigit = decimalsArray[i];
                    // the new numer could have not decimal part, but we need it anyway
                    if (digits[1]) {
                        decimalsArray[i] = digits[1].charAt(i);
                    }
                    if (decimalsArray[i] == '') {
                        decimalsArray[i] = '0';
                    }
                    updatePosition($this.find('.jodometer_decimal_' + i), parseInt(decimalsArray[i]), parseInt(oldDigit));
                }
            }

            integers = digits[0];
            j = integers.length - 1;
            // for each integer digit, update the old digit position to the new
            for (i = 0; i < integersArray.length; i++) {
                oldDigit = integersArray[i];
                integersArray[i] = integers.charAt(j);
                if (integersArray[i] == '') {
                    integersArray[i] = '0';
                }
                //alert($this);
                updatePosition($this.find('.jodometer_integer_' + i), parseInt(integersArray[i]), parseInt(oldDigit));
                j--;
            }
            
            j = integersArray.length - 1;
            if(settings.trimZero) {
                //debugger;
                var column = $this.children().last(),
                    show = false;
                
                while(column.length){ //
                    if (column.is('.jodometer_dot')){
                        column.toggle(show);
                    }
                    else if(column.attr('class').match(/\bjodometer_integer/)){
                        if(!show && integersArray[j] != '0'){
                            show = true;
                        }
                        //console.log(integersArray);
                        column.toggle(show);
                        j--;
                    }
                    else {
                        break;
                    }
                    column = column.prev();
                }
            }
        }
        // changes the column position from one number to another


        function updatePosition(col, newDigit, oldDigit) {
            if (newDigit != oldDigit) {
                col.stop(true, true);
                // if the number is 0 use the bottom 0 in the image, and change instantly to the top 0
                if (newDigit == 0) {
                    col.animate({
                        top: (10 * settings.heightNumber * -1) + zeroSet
                    }, settings.speed, settings.easing).animate({
                        top: zeroSet
                    }, 1, 'linear');
                } else {
                    // if the new number is lower than the old, we have to go to the bottom 0 and start from the top 0, with the appropiate speed, to don't note the jump
                    if (newDigit < oldDigit) {
                        var firstRoll = settings.speed * (10 - oldDigit) / (10 - oldDigit + newDigit);
                        col.animate({
                            top: (10 * settings.heightNumber * -1) + zeroSet
                        }, firstRoll, 'linear').animate({
                            top: zeroSet
                        }, 0).animate({
                            top: (newDigit * settings.heightNumber * -1) + zeroSet
                        }, settings.speed - firstRoll, 'linear');
                    } else {
                        col.animate({
                            top: (newDigit * settings.heightNumber * -1) + zeroSet
                        }, settings.speed, settings.easing);
                    }
                }
            }
        }
        return this;
        // });
    };
    // default settings
    $.fn.jOdometer.defaults = {
        counterStart: '000000',
        counterEnd: false,
        delayTime: 1000,
        increment: 1,
        speed: 500,
        easing: 'swing',
        formatNumber: false,
        heightNumber: 31,
        widthNumber: 14,
        offsetRight: 0,
        spaceNumbers: 0,
        widthDot: 10,
        trimZero: false
    };
})(jQuery);

/* sample code
counter = jQuery('#counter').jOdometer({
    increment: 0,
    counterStart: '00000000',
    spaceNumbers: 2,
    offsetRight: 5,
    heightNumber: 50,
    widthNumber: 24,
    formatNumber: true,
    trimZero: true
});
jQuery('#counter_default').jOdometer({});

nextVal = 0;
increment = function() {
    nextVal += Math.random() * 15000;
    counter.goToNumber(nextVal);
}​
*/