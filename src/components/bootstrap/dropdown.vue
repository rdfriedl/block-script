<template>
	<div class="btn-group">
		<slot></slot>
		<slot name="dropdown-menu"></slot>
	</div>
</template>
<script>
	export default {
		ready() {
			$(this.$el).find('[data-toggle="dropdown"]').dropdown();
		}
	}
</script>
