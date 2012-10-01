$(function() {
  $.fn.animationComplete = function(callback) {
    var animationEnd;
    if (Modernizr.cssanimations) {
      animationEnd = "animationend webkitAnimationEnd";
      if ($.isFunction(callback)) {
        return $(this).one(animationEnd, callback);
      }
    } else {
      setTimeout(callback, 0);
      return $(this);
    }
  };
  $.fn.transitionComplete = function(callback) {
    var transitionEnd;
    if (Modernizr.csstransitions) {
      transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd";
      if ($.isFunction(callback)) {
        return $(this).one(transitionEnd, callback);
      }
    } else {
      setTimeout(callback, 0);
      return $(this);
    }
  };
  $.fn.animateCSS = function(animation, callback) {
    animation || (animation = "none");
    $(this).addClass("animated " + animation).animationComplete(function() {
      $(this).removeClass("animated " + animation);
      if (callback) {
        return callback();
      }
    });
    return $(this);
  };
  $.fn.transitionCSS = function(transition, callback) {
    transition || (transition = "none");
    $(this).addClass("transitioned " + transition).transitionComplete(function() {
      $(this).removeClass("transitioned " + transition);
      if (callback) {
        return callback();
      }
    });
    return $(this);
  };
  $.getScreenHeight = function() {
    return window.innerHeight || $(window).height();
  };
  $.getMaxScrollForTransition = function() {
    return $.getScreenHeight() * 3;
  };
  return $.pageTransition = function(name, reverse, toScroll, $to, $from) {
    var $viewport, activePageClass, cleanFrom, deferred, doneIn, doneOut, focusPage, maxTransitionOverride, maxTransitionWidth, none, reverseClass, screenHeight, scrollPage, sequential, startIn, startOut, toPreClass, toggleViewportClass;
    sequential = false;
    deferred = new $.Deferred();
    reverseClass = (reverse ? " reverse" : "");
    activePageClass = "active ";
    maxTransitionWidth = false;
    screenHeight = $.getScreenHeight();
    maxTransitionOverride = maxTransitionWidth !== false && $(window).width() > maxTransitionWidth;
    none = maxTransitionOverride || !name || name === "none" || Math.max($(window).scrollTop(), toScroll) > $.getMaxScrollForTransition();
    toPreClass = " page-pre-in";
    $viewport = $('.mobile-viewport');
    toggleViewportClass = function(out) {
      if (out) {
        return $viewport.removeClass("mobile-viewport-transitioning viewport-" + name);
      } else {
        return $viewport.addClass("mobile-viewport-transitioning viewport-" + name);
      }
    };
    focusPage = function(page) {
      var autofocus, pageTitle;
      autofocus = page.find("[autofocus]");
      pageTitle = page.find(".title:eq(0)");
      if (autofocus.length) {
        autofocus.focus();
        return;
      }
      if (pageTitle.length) {
        return pageTitle.focus();
      } else {
        return page.focus();
      }
    };
    scrollPage = function() {
      if (!scrollTo) {
        return window.scrollTo(0, toScroll);
      }
    };
    cleanFrom = function() {
      return $from.removeClass(activePageClass + " out in reverse " + name).height("");
    };
    startOut = function() {
      if (!sequential) {
        doneOut();
      } else {
        $from.animationComplete(doneOut);
      }
      return $from.height(screenHeight + $(window).scrollTop()).addClass(name + " out" + reverseClass);
    };
    doneOut = function() {
      if ($from && sequential) {
        cleanFrom();
      }
      return startIn();
    };
    startIn = function() {
      $to.css("z-index", -10);
      $to.addClass(activePageClass + toPreClass);
      focusPage($to);
      $to.height(screenHeight + toScroll);
      $to.css("z-index", "");
      if (!none) {
        $to.animationComplete(doneIn);
      }
      $to.removeClass(toPreClass).addClass(name + " in" + reverseClass);
      if (none) {
        return doneIn();
      }
    };
    doneIn = function() {
      if (!sequential ? $from : void 0) {
        cleanFrom();
      }
      $to.removeClass("out in reverse " + name).height("");
      toggleViewportClass(true);
      $to.addClass(activePageClass);
      if ($(window).scrollTop() !== toScroll) {
        scrollPage();
      }
      return deferred.resolve(name, reverse, toScroll, $to, $from, true);
    };
    if ($from && !none) {
      startOut();
    } else {
      doneOut();
    }
    return deferred.promise();
  };
});
