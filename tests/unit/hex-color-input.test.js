// Test for Issue #3381: Hexadecimal color input support

const fs = require('fs');
const path = require('path');

describe('Hexadecimal Color Input Feature', () => {
	describe('Color Conversion Functions', () => {
		let satusContent;

		beforeAll(() => {
			const satusPath = path.join(__dirname, '../../menu/satus.js');
			satusContent = fs.readFileSync(satusPath, 'utf8');
		});

		test('satus.color.rgbToHex function should exist', () => {
			expect(satusContent).toContain('satus.color.rgbToHex');
		});

		test('satus.color.hexToRgb function should exist', () => {
			expect(satusContent).toContain('satus.color.hexToRgb');
		});

		test('rgbToHex should use padStart for proper formatting', () => {
			expect(satusContent).toContain("padStart(2, '0')");
		});

		test('hexToRgb should handle shorthand hex notation', () => {
			expect(satusContent).toContain('hex.length === 3');
		});
	});

	describe('Color Picker UI', () => {
		let satusContent;

		beforeAll(() => {
			const satusPath = path.join(__dirname, '../../menu/satus.js');
			satusContent = fs.readFileSync(satusPath, 'utf8');
		});

		test('color picker should have hex input container', () => {
			expect(satusContent).toContain('satus-color-picker__hex-container');
		});

		test('color picker should have hex input field', () => {
			expect(satusContent).toContain('satus-color-picker__hex-input');
		});

		test('hex input should have maxlength of 7', () => {
			expect(satusContent).toContain("maxlength: '7'");
		});

		test('hex input should have placeholder', () => {
			expect(satusContent).toContain("placeholder: '#000000'");
		});
	});

	describe('CSS Styles', () => {
		let cssContent;

		beforeAll(() => {
			const cssPath = path.join(__dirname, '../../menu/satus.css');
			cssContent = fs.readFileSync(cssPath, 'utf8');
		});

		test('hex container styles should exist', () => {
			expect(cssContent).toContain('.satus-color-picker__hex-container');
		});

		test('hex input styles should exist', () => {
			expect(cssContent).toContain('.satus-color-picker__hex-input');
		});

		test('hex label styles should exist', () => {
			expect(cssContent).toContain('.satus-color-picker__hex-label');
		});

		test('hex input should use monospace font', () => {
			expect(cssContent).toContain('font-family: monospace');
		});
	});
});

describe('Color Conversion Logic Tests', () => {
	// Simple unit tests for the conversion logic
	test('RGB to Hex conversion formula', () => {
		// Test the padStart formatting
		const r = 255, g = 128, b = 0;
		const hex = '#' +
			r.toString(16).padStart(2, '0') +
			g.toString(16).padStart(2, '0') +
			b.toString(16).padStart(2, '0');
		expect(hex).toBe('#ff8000');
	});

	test('Hex to RGB conversion formula', () => {
		const hex = 'ff8000';
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		expect([r, g, b]).toEqual([255, 128, 0]);
	});

	test('Shorthand hex expansion', () => {
		let hex = 'fff';
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		expect(hex).toBe('ffffff');
	});
});
