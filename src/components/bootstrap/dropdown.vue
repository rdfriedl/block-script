<template>
	<div class="btn-group">
		<slot></slot>
		<slot name="dropdown-menu"></slot>
	</div>
</template>
<script>
import 'script-loader!jquery';
import Vue from 'vue';

export default {
	mounted() {
		Vue.nextTick(() => {
			$(this.$el).find('[data-toggle="dropdown"]').dropdown();
		})
	}
}
</script>
