global.extension = {
	skeleton: {
		main: {
			layers: {
				section: {}
			}
		}
	}
};

global.satus = {
	storage: {
		onchanged: jest.fn()
	}
};

require('../../menu/skeleton-parts/appearance.js');
require('../../menu/skeleton-parts/player.js');

describe('Player controls menu redirect (#4215)', () => {
	test('opens the shared hide-controls options section', () => {
		const playerSection = extension.skeleton.main.layers.section.player.on.click;
		const redirect = playerSection.section_2.player_hide_controls_options.on.click;
		const target = redirect
			.split('.')
			.reduce((skeleton, key) => skeleton[key], extension.skeleton);

		expect(target).toBe(
			extension.skeleton.main.layers.section.appearance.on.click.player.on.click
				.section_1.player_hide_controls_options.on.click
		);
		expect(target.component).toBe('section');
		expect(target.player_play_button.component).toBe('switch');
	});
});
