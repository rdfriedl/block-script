<template>
<a class="btn btn-md btn-info pull-left margin-10" v-link="'/menu'" style="position: fixed;"><i class="fa fa-arrow-left"></i> Back</a>

<div class="col-xs-12 col-sm-8 col-sm-offset-2">
	<h1 class="text-center"><i class="fa fa-image"></i> Maps</h1>
	<table class="table table-hover table-bordered">
		<thead>
			<tr>
				<th><h4>#</h4></th>
				<th><h4>Name</h4></th>
				<th><h4>Description</h4></th>
				<th><h4></h4></th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="map in maps">
				<td>{{map.id}}</td>
				<td>{{map.name}}</td>
				<td><pre>{{map.description}}</pre></td>
				<td><div class="btn-group btn-group-sm pull-right">
					<button type="button" class="btn btn-success" @click="loadMap(map.id)"><i class="fa fa-play"></i></button>
					<button type="button" class="btn btn-danger" @click="removeMap(map.id)"><i class="fa fa-trash"></i></button>
				</div></td>
			</tr>
		</tbody>
	</table>
</div>

</template>
<script>

export default {
	data(){
		return {
			maps: [
				{
					id: 614351,
					name: 'Map 1',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 47578,
					name: 'Map 4',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 4534,
					name: 'Map 2',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 454,
					name: 'Map 3',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 47578,
					name: 'Map 4',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 783,
					name: 'Map 5',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 78523,
					name: 'Map 6',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 783,
					name: 'Map 5',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 78523,
					name: 'Map 6',
					description: 'this is a test map\nthat i made'
				},
				{
					id: 454,
					name: 'Map 3',
					description: 'this is a test map\nthat i made'
				},
			]
		};
	},
	methods: {
		loadMap(id){
			this.$router.go('/play/'+id);
		},
		removeMap(id){
			console.warn('removing map: '+id);
		}
	}
}

</script>
