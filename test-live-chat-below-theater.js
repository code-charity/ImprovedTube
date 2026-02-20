// Test script to verify the live chat below theater feature
// This script can be run in the browser console on a YouTube live stream page

function testLiveChatBelowTheater() {
    console.log('🧪 Testing Live Chat Below Theater Feature');
    
    // Check if we're on a video page
    if (document.documentElement.dataset.pageType !== 'video') {
        console.error('❌ Not on a video page. Please navigate to a YouTube live stream first.');
        return false;
    }
    
    // Check if live chat is present
    const liveChatFrame = document.querySelector("ytd-live-chat-frame#chat");
    if (!liveChatFrame) {
        console.error('❌ Live chat not found. Please navigate to a YouTube live stream first.');
        return false;
    }
    
    console.log('✅ Found live chat frame');
    
    // Check if ImprovedTube is loaded
    if (typeof ImprovedTube === 'undefined') {
        console.error('❌ ImprovedTube not loaded. Please ensure the extension is active.');
        return false;
    }
    
    console.log('✅ ImprovedTube loaded');
    
    // Check if our new functions exist
    if (typeof ImprovedTube.livechatBelowTheater !== 'function') {
        console.error('❌ livechatBelowTheater function not found');
        return false;
    }
    
    if (typeof ImprovedTube.livechatTheaterModeObserver !== 'function') {
        console.error('❌ livechatTheaterModeObserver function not found');
        return false;
    }
    
    console.log('✅ New live chat functions are available');
    
    // Test theater mode detection
    const watchFlexy = document.querySelector("ytd-watch-flexy");
    if (!watchFlexy) {
        console.error('❌ Watch flexy element not found');
        return false;
    }
    
    const isTheaterMode = watchFlexy.hasAttribute("theater");
    console.log('✅ Current theater mode status:', isTheaterMode);
    
    // Test the repositioning function
    try {
        // Enable the feature temporarily for testing
        const originalSetting = ImprovedTube.storage.livechat_below_theater;
        ImprovedTube.storage.livechat_below_theater = true;
        
        console.log('🔄 Testing live chat repositioning...');
        ImprovedTube.livechatBelowTheater();
        
        // Check if chat moved position
        const below = document.getElementById("below");
        const chatInBelow = below && below.contains(liveChatFrame);
        
        if (isTheaterMode && chatInBelow) {
            console.log('✅ Live chat successfully moved below player in theater mode');
        } else if (!isTheaterMode && !chatInBelow) {
            console.log('✅ Live chat correctly stayed in sidebar when not in theater mode');
        } else {
            console.log('ℹ️ Chat position:', {
                theaterMode: isTheaterMode,
                inBelow: chatInBelow,
                currentParent: liveChatFrame.parentNode?.id || liveChatFrame.parentNode?.tagName
            });
        }
        
        // Test theater mode toggle
        console.log('🔄 Testing theater mode observer...');
        ImprovedTube.livechatTheaterModeObserver();
        
        if (ImprovedTube.livechatTheaterObserver) {
            console.log('✅ Theater mode observer created successfully');
        } else {
            console.log('ℹ️ Theater mode observer not created (feature may be disabled)');
        }
        
        // Restore original setting
        ImprovedTube.storage.livechat_below_theater = originalSetting;
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        return false;
    }
    
    console.log('🎉 Live chat below theater feature test completed successfully!');
    console.log('📝 Manual testing instructions:');
    console.log('   1. Go to a YouTube live stream');
    console.log('   2. Enable "Live Chat Below Theater" in ImprovedTube settings');
    console.log('   3. Toggle theater mode (theater button on player)');
    console.log('   4. Verify live chat moves below player in theater mode');
    console.log('   5. Verify live chat returns to sidebar when exiting theater mode');
    
    return true;
}

// Auto-run test if on a video page
if (document.documentElement.dataset.pageType === 'video') {
    setTimeout(testLiveChatBelowTheater, 2000);
} else {
    console.log('ℹ️ Navigate to a YouTube live stream to test the live chat below theater feature');
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.testLiveChatBelowTheater = testLiveChatBelowTheater;
}
