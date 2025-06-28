//  Sticky Navbar Animation Script 
$(document).ready(function () {
    function updateNavbarStyles() {
        if ($(window).width() <= 992) {
            if ($('.navbar').hasClass('scrolled')) {
                $('.navbar-collapse').css('background-color', '#0f1010e2', '');
            } else {
                $('.navbar-collapse').css('background-color', 'white');
            }
        } else {
            // Reset background color for desktop view
            $('.navbar-collapse').css('background-color', 'transparent'); // Or set a specific color
        }
    }

    function updateTogglerIconColor() {
        if ($('.navbar').hasClass('scrolled')) {
            $('.navbar-toggler-icon').css('background-color', '#fff'); // Change to white when scrolled
        } else {
            $('.navbar-toggler-icon').css('background-color', 'transparent '); // Change to black when at the top
        }
    }

    // Change the navbar background when scrolled
    $(window).scroll(function () {
        if ($(this).scrollTop() > 10) {
            // For nav bar 
            $('.navbar').addClass('scrolled');
            // For logo
            $('.navbar-brand img').attr('src', './images/logo-1.png'); 
            updateTogglerIconColor(); // Update toggler icon color on scroll
            updateNavbarStyles(); // Update navbar styles on scroll
        } else {
            $('.navbar').removeClass('scrolled');
            $('.navbar-brand img').attr('src', './images/logo-Black.png');
            updateTogglerIconColor(); // Update toggler icon color on scroll
            updateNavbarStyles(); // Update navbar styles on scroll
        }
    });

    // Update styles on window resize
    $(window).resize(function () {
        updateNavbarStyles();
        updateTogglerIconColor(); // Ensure toggler icon color is updated on resize
    });

    // Initial call to set styles based on initial window size
    updateNavbarStyles();
    updateTogglerIconColor(); // Set initial toggler icon color
});
