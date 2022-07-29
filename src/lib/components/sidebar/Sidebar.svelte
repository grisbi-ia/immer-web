<script context="module" lang="ts">
	import { groups } from '$lib/stores/store';
	import { get } from 'svelte/store';
</script>

<script>
	import Group from './Group.svelte';

	/*
	const root = [
		{
			name: 'Freno',
			id: '1',
			groups: [
				{ name: 'Protector de Barras', id: '101' },
				{ name: 'Protector de Manos', id: '102' },
				{ name: 'Protector de Motor', id: '103' },
				{ name: 'Protector de Tanque', id: '104' },
				{ name: 'Soporte Celular ', id: '105' },
				{ name: 'Protector de Barras', id: '106' },
				{ name: 'Protector de Barras', id: '107' }
			]
		},
		{
			name: 'Bateria',
			id: '2',
			groups: [
				{ name: 'Protector de Barras', id: '201' },
				{ name: 'Protector de Manos', id: '202' },
				{ name: 'Protector de Motor', id: '203' }
			]
		},
		{
			name: 'Casco',
			id: '3',
			groups: [
				{ name: 'Protector de Barras', id: '301' },
				{ name: 'Protector de Manos', id: '302' },
				{ name: 'Protector de Motor', id: '303' }
			]
		},
		{
			name: 'Herramientas',
			id: '4',
			groups: [
				{ name: 'Protector de Barras', id: '401' },
				{ name: 'Protector de Manos', id: '402' },
				{ name: 'Protector de Motor', id: '403' }
			]
		}
	];*/
</script>

<Group name="Todas" id="null" groups={get(groups)} expanded />
