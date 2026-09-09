// Test for Issue #4003: Cinema mode / auto cinema mode bugged
//
// Symptom: With "Auto cinema mode" enabled, clicking on a YouTube video shows
// a blank screen and the video doesn't load.
//
// Root cause:
//  - createOverlay() paints an opaque black overlay (rgba(0,0,0,1)) with
//    z-index 9999.
//  - In playerCinemaModeEnable(), the player's z-index was set to 10000
//    AFTER the overlay was already created and displayed, meaning there
//    was a paint frame where the opaque overlay sat on top of the player.
//
// Fix:
//  - Set the player's z-index (10000) BEFORE creating the overlay, so the
//    player is always above the curtain from the first paint frame.
//  - The overlay stays opaque — it's a curtain that dims the rest of the
//    page. The player simply needs a higher z-index.

const fs = require('fs');
const path = require('path');

describe('Cinema mode bug (#4003)', () => {
	let playerContent;

	beforeAll(() => {
		const playerPath = path.join(
			__dirname,
			'../../js&css/web-accessible/www.youtube.com/player.js'
		);
		playerContent = fs.readFileSync(playerPath, 'utf8');
	});

	describe('createOverlay() — curtain with z-index below player', () => {
		test('overlay z-index must stay below the player (player at 10000)', () => {
			const overlayMatch = playerContent.match(
				/function\s+createOverlay\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(overlayMatch).not.toBeNull();
			const zMatch = overlayMatch[0].match(/zIndex\s*=\s*['"](\d+)['"]/);
			expect(zMatch).not.toBeNull();
			expect(Number(zMatch[1])).toBeLessThan(10000);
		});
	});

	describe('playerCinemaModeEnable() — player must render above overlay', () => {
		test('player z-index must be set before the overlay is created', () => {
			// Order matters: bring the player to the front first, then add the
			// overlay, so there's never a paint frame where the opaque overlay
			// sits on top of an unstyled player.
			const enableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeEnable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(enableMatch).not.toBeNull();

			const enableBody = enableMatch[0];
			const playerZIndexPos = enableBody.indexOf("'player-full-bleed-container'");
			const createOverlayPos = enableBody.indexOf('createOverlay(');

			expect(playerZIndexPos).toBeGreaterThan(-1);
			expect(createOverlayPos).toBeGreaterThan(-1);
			expect(playerZIndexPos).toBeLessThan(createOverlayPos);
		});

		test('player z-index must be > overlay z-index in cinema mode enable', () => {
			const overlayZ = Number(
				playerContent
					.match(/function\s+createOverlay[\s\S]*?zIndex\s*=\s*['"](\d+)['"]/)[1]
			);
			const enableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeEnable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(enableMatch).not.toBeNull();

			// All three player containers must be bumped to a higher z-index
			// than the overlay. 10000 is the long-standing value used here.
			expect(enableMatch[0]).toMatch(/player-full-bleed-container[\s\S]*?zIndex\s*=\s*10000/);
			expect(10000).toBeGreaterThan(overlayZ);
		});
	});

	describe('playerCinemaModeDisable() — cleanup must be symmetric', () => {
		test('disable must clear position to remove the inline stacking context', () => {
			// When cinema mode is turned off, player containers must lose both
			// the inline z-index AND the inline position so YouTube's CSS
			// stacking is restored.
			const disableMatch = playerContent.match(
				/ImprovedTube\.playerCinemaModeDisable\s*=\s*function\s*\(\s*\)\s*\{[\s\S]*?\n\}/
			);
			expect(disableMatch).not.toBeNull();
			expect(disableMatch[0]).toMatch(/playerContainer\.style\.position\s*=\s*['"]['"]/);
		});
	});
});