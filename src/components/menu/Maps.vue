<template>
<a class="btn btn-md btn-info pull-left margin-10" v-link="'/menu'" style="position: fixed; z-index:100;"><i class="fa fa-arrow-left"></i> Back</a>

<div class="flex-v">
	<h1 class="text-center"><i class="fa fa-image"></i> Maps</h1>
	<div class="scroll-v scroll-custom">
		<div class="col-sm-8 col-sm-offset-2">
			<div class="btn-group pull-right btn-group-sm">
				<button type="button" class="btn btn-info" @click="onRefresh"><i class="fa fa-refresh" :class="{'fa-spin': refreshing}"></i></button>
				<button type="button" class="btn btn-success" @click="createModalOpen = true"><i class="fa fa-plus"></i> New map</button>
			</div>
			<h4 class="text-center" style="margin-top: 10vh;" v-show="maps.length == 0 && refreshing == false">
				Looks like you dont have any maps <button type="button" class="btn btn-success btn-sm" @click="createModalOpen = true">Create a new one</button>
			</h4>
			<table class="table table-hover table-bordered" v-show="maps.length > 0">
				<thead>
					<tr>
						<th><h5>#</h5></th>
						<th><h5>Name</h5></th>
						<th><h5>Description</h5></th>
						<th><h5></h5></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="map in maps">
						<td width="6">{{map.id}}</td>
						<td>{{map.name}}</td>
						<td><pre>{{map.description}}</pre></td>
						<td width="80"><div class="btn-group btn-group-sm pull-right">
							<button type="button" class="btn btn-success" @click="loadMap(map.id)"><i class="fa fa-play"></i></button>
							<button type="button" class="btn btn-danger" @click="removeMap(map.id)"><i class="fa fa-trash"></i></button>
						</div></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- create modal -->
<modal effect="fade" :show.sync="createModalOpen">
	<div slot="modal-header" class="modal-header">
		<h4 class="modal-title">Create Map</h4>
	</div>
	<div slot="modal-body" class="modal-body">
		<form @submit.prevent="onCreateModalSubmit">
			<div class="form-group">
				<label>Map Name</label>
				<input type="text" class="form-control" v-model="newMap.name" required>
			</div>
			<div class="form-group">
				<label>Description</label>
				<textarea class="form-control" v-model="newMap.description"></textarea>
			</div>
			<button type="button" class="btn btn-default" @click="createModalOpen = false">Cancel</button>
			<button type="submit" class="btn btn-success pull-right">Create</button>
		</form>
	</div>
	<div slot="modal-footer"></div>
</modal>

</template>
<script>

import MapLoaderIndexedDB from '../../js/maps/MapLoaderIndexedDB.js';
import MapManager from '../../js/maps/MapManager.js';
import Dexie from 'dexie';
import {modal} from 'vue-strap';
import BootstrapDialog from 'bootstrap-dialog';

export default {
	components: {modal},
	data(){return{
		maps: [],
		newMap: {
			name: '',
			description: ''
		},
		refreshing: false
	}},
	computed: {
		createModalOpen: {
			get(){return this.$route.params.modal == 'create'},
			set(v){v? this.$router.go('/maps/create') : this.$router.go('/maps')}
		}
	},
	methods: {
		loadMapsList(){
			this.maps = [];
			return new Promise((resolve, reject) => {
				MapManager.inst.listMaps().then(ids => {
					let wait = [];
					ids.forEach(id => {
						wait.push(MapManager.inst.getMapLoader(id).then(loader => {
							loader.loadData().then(data => {
								//add the map
								this.maps.push({
									id: data.id || id,
									name: data.name,
									description: data.description
								});
							})
						}))
					})

					Promise.all(wait).then(resolve);
				});
			})
		},
		loadMap(id){
			this.$router.go('/play/'+id);
		},
		getMap(id){
			for(let i in this.maps){
				if(this.maps[i].id == id)
					return this.maps[i];
			}
		},
		removeMap(id){
			return MapManager.inst.deleteMap(id)
				.then(this.loadMapsList, err => {
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: 'Failed to remove map',
						message: `<pre>${err.message}</prev`
					})
				})
		},
		createMap(data){
			return MapManager.inst.createMap('indexedDB',data).then(loader => {
				//add the map
				this.maps.push({
					id: loader.data.id,
					name: loader.data.name,
					description: loader.data.description
				});
			}, (err) => {
				BootstrapDialog.show({
					type: BootstrapDialog.TYPE_DANGER,
					title: 'Failed to create map',
					message: `<pre>${err.message}</prev`
				})
			});
		},

		onCreateModalSubmit(){
			if(this.newMap.name.trim().length > 0){
				this.createMap(this.newMap).then(() => {
					this.createModalOpen = false;

					//reset
					this.newMap.name = this.newMap.description = '';
				});
			}
		},
		onRefresh(){
			this.refreshing = true;
			this.loadMapsList().then(() => this.refreshing = false);
		}
	},
	created(){
		this.loadMapsList();
	}
};

</script>
