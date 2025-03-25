jQuery(document).ready(function($) {
    let device_id = localStorage.getItem('bch_device_id');
    if (!device_id) {
        device_id = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('bch_device_id', device_id);
    }

    function wrapAds() {
        $('ins.adsbygoogle').each(function() {
            if (!$(this).parent().hasClass('adsense-wrapper')) {
                $(this).wrap('<div class="adsense-wrapper"></div>');
            }
        });
    }

    // Initial wrapping
    wrapAds();

    // Re-wrap ads after new ads are loaded
    (function() {
        const originalPush = window.adsbygoogle.push;
        window.adsbygoogle.push = function(...args) {
            originalPush.apply(this, args);
            wrapAds();
        };
    })();

    // Check quarantine status
    function checkQuarantine(callback) {
        $.ajax({
            type: 'POST',
            url: bch_ajax.ajax_url,
            data: {
                action: 'bch_check_quarantine',
                device_id: device_id
            },
            success: function(response) {
                if (response.success) {
                    callback(false);
                } else {
                    callback(true);
                }
            }
        });
    }

    $('body').on('click', '.adsense-wrapper', function(e) {
        checkQuarantine(function(isQuarantined) {
            if (isQuarantined) {
                e.preventDefault();
                alert('You are in quarantine and cannot click ads.');
            } else {
                $.ajax({
                    type: 'POST',
                    url: bch_ajax.ajax_url,
                    data: {
                        action: 'bch_handle_click',
                        device_id: device_id
                    },
                    success: function(response) {
                        if (response.success) {
                            console.log('Click registered');
                        } else {
                            console.log(response.data);
                        }
                    }
                });
            }
        });
    });
});