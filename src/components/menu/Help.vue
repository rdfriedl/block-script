<template>
<a class="btn btn-md btn-info pull-left margin-10" v-link="'/menu'" style="position: fixed; z-index:100;"><i class="fa fa-arrow-left"></i> Back</a>

<div class="col-xs-12">
	<h1 style="text-align: center;"><i class="fa fa-question"></i> Help</h1>
</div>
<div class="col-xs-12 col-md-6 col-md-offset-3">
	<div role="tabpanel">
	  	<!-- Nav tabs -->
	  	<ul class="nav nav-tabs" role="tablist">
	  	  	<li v-link="{path: '/help', activeClass: 'active', exact: true}"><a><i class="fa fa-question"></i> General</a></li>
	  	  	<li v-link="{path: '/help/game', activeClass: 'active'}"><a><i class="fa fa-gamepad"></i> In-Game</a></li>
	  	  	<li v-link="{path: '/help/maps', activeClass: 'active'}"><a><i class="fa fa-picture-o"></i> Maps</a></li>
	  	</ul>

	  	<hr>

	  	<!-- Tab panes -->
  	  	<div v-show="$route.params.topic == ''">
  	  	</div>
  	  	<div v-show="$route.params.topic == 'game'">
  	  		<div class="panel panel-default">
			  	<div class="panel-heading">Controls</div>
		  		<div class="panel-body">
				  	<table class="table">
				  		<thead>
				  			<tr>
				  				<td>Action</td>
				  				<td>Primary Key</td>
				  				<td>Secondary Key</td>
				  			</tr>
				  		</thead>
				    	<tbody>
				    		<tr>
				    			<td>Move Forward / Backwards</td>
				    			<td><kbd>W</kbd> / <kbd>S</kbd></td>
				    			<td><kbd>Up</kbd> / <kbd>Down</kbd> Arrows</td>
				    		</tr>
				    		<tr>
				    			<td>Move Left / Right</td>
				    			<td><kbd>A</kbd> / <kbd>D</kbd></td>
				    			<td><kbd>Left</kbd> / <kbd>Right</kbd> Arrows</td>
				    		</tr>
				    		<tr>
				    			<td>Jump</td>
				    			<td><kbd>Space</kbd></td>
				    			<td><kbd>Num 0</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Sprint</td>
				    			<td><kbd>Shift</kbd></td>
				    			<td></td>
				    		</tr>
				    		<tr>
				    			<td>Open Inventory</td>
				    			<td><kbd>E</kbd></td>
				    			<td></td>
				    		</tr>
				    		<tr>
				    			<td>Open Menu</td>
				    			<td><kbd>Esc</kbd></td>
				    			<td><kbd>`</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Place Block</td>
				    			<td><kbd>Right Mouse Button</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Remove Block</td>
				    			<td><kbd>Left Mouse Button</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Copy Block</td>
				    			<td><kbd>Middle Mouse Button</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Rotate Block</td>
				    			<td><kbd>Mouse Wheel</kbd></td>
				    		</tr>
				    		<tr>
				    			<td>Debug Mode</td>
				    			<td><kbd>F8</kbd></td>
				    		</tr>
				    	</tbody>
				  	</table>
		  		</div>
  	  		</div>
  	  	</div>
  	  	<div v-show="$route.params.topic == 'maps'">
  	  		<ul class="pager">
  	  			<li><a href="#">Previous</a></li>
  	  			<li><a href="#">Next</a></li>
  	  		</ul>
		</div>
	</div>
</div>

</template>
<script>

export default {
	data(){
		return {};
	},
	activate(){
		console.log('active');
	}
}

</script>
