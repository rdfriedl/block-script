<template>
<input type="checkbox" value="">
</template>

<script>
import 'script-loader!jquery';
import Vue from 'vue';
import 'script-loader!bootstrap-switch/dist/js/bootstrap-switch.min.js';
import 'bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css';

export default {
	props: {
		state: {
			type: Boolean,
			required: true
		},
		size: {type: String, default: $.fn.bootstrapSwitch.defaults.animate},
		animate: {type: Boolean, default: $.fn.bootstrapSwitch.defaults.animate},
		disabled: {type:Boolean, default: $.fn.bootstrapSwitch.defaults.disabled},
		readOnly: {type:Boolean, default: $.fn.bootstrapSwitch.defaults.readOnly},
		inverse: {type:Boolean, default: $.fn.bootstrapSwitch.defaults.inverse},
		onColor: {type: String, default: $.fn.bootstrapSwitch.defaults.onColor},
		offColor: {type: String, default: $.fn.bootstrapSwitch.defaults.offColor},
		onText: {type: String, default: $.fn.bootstrapSwitch.defaults.onText},
		offText: {type: String, default: $.fn.bootstrapSwitch.defaults.offText},
		labelText: {type: String, default: $.fn.bootstrapSwitch.defaults.labelText},
		handleWidth: {default: $.fn.bootstrapSwitch.defaults.handleWidth},
		labelWidth: {default: $.fn.bootstrapSwitch.defaults.labelWidth},
		onChange: Function
	},
	methods: {
		update(){
			$(this.$el).bootstrapSwitch({
				size: this.size,
				animate: this.animate,
				disabled: this.disabled,
				readOnly: this.readOnly,
				inverse: this.inverse,
				onColor: this.onColor,
				offColor: this.offColor,
				onText: this.onText,
				offText: this.offText,
				labelText: this.labelText,
				handleWidth: this.handleWidth,
				labelWidth: this.labelWidth
			});
			$(this.$el).bootstrapSwitch('state', this.state);
		}
	},
	mounted(){
		let changeFromElement = false;
		$(this.$el).on('switchChange.bootstrapSwitch', () => {
			changeFromElement = true;
			this.state = $(this.$el).bootstrapSwitch('state');
			changeFromElement = false;

			if(this.onChange)
				this.onChange(this.state);
		});

		this.$watch('state', () => {
			if(changeFromElement == false)
				this.update();
			else
				this.$emit('input', this.state);
		}, {immediate: true});
		this.$watch('size', this.update.bind(this));
		this.$watch('animate', this.update.bind(this));
		this.$watch('disabled', this.update.bind(this));
		this.$watch('readOnly', this.update.bind(this));
		this.$watch('inverse', this.update.bind(this));
		this.$watch('onColor', this.update.bind(this));
		this.$watch('offColor', this.update.bind(this));
		this.$watch('onText', this.update.bind(this));
		this.$watch('offText', this.update.bind(this));
		this.$watch('labelText', this.update.bind(this));
		this.$watch('handleWidth', this.update.bind(this));
		this.$watch('labelWidth', this.update.bind(this));

		Vue.nextTick(() => this.update());
	},
	destroyed(){
		$(this.$el).bootstrapSwitch('destroy');
	}
}
</script>
