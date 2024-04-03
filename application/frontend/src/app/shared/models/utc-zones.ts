/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export interface Timezone {
  description: string;
  offset: number;
  label: string;
}

export const utcTimezones: Timezone[] = [
  {
    label: '-12:00',
    description: 'Etc/GMT+12',
    offset: -43200,
  },
  {
    label: '-11:00',
    description: 'Etc/GMT+11',
    offset: -39600,
  },
  {
    label: '-11:00',
    description: 'Pacific/Midway',
    offset: -39600,
  },
  {
    label: '-11:00',
    description: 'Pacific/Niue',
    offset: -39600,
  },
  {
    label: '-11:00',
    description: 'Pacific/Pago Pago',
    offset: -39600,
  },
  {
    label: '-11:00',
    description: 'Pacific/Samoa',
    offset: -39600,
  },
  {
    label: '-11:00',
    description: 'US/Samoa',
    offset: -39600,
  },
  {
    label: '-10:00',
    description: 'America/Adak',
    offset: -36000,
  },
  {
    label: '-9:00',
    description: 'America/Adak (DST)',
    offset: -32400,
  },
  {
    label: '-10:00',
    description: 'America/Atka',
    offset: -36000,
  },
  {
    label: '-9:00',
    description: 'America/Atka (DST)',
    offset: -32400,
  },
  {
    label: '-10:00',
    description: 'Etc/GMT+10',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'HST',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'Pacific/Honolulu',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'Pacific/Johnston',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'Pacific/Rarotonga',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'Pacific/Tahiti',
    offset: -36000,
  },
  {
    label: '-10:00',
    description: 'US/Aleutian',
    offset: -36000,
  },
  {
    label: '-9:00',
    description: 'US/Aleutian (DST)',
    offset: -32400,
  },
  {
    label: '-10:00',
    description: 'US/Hawaii',
    offset: -36000,
  },
  {
    label: '-9:30',
    description: 'Pacific/Marquesas',
    offset: -34200,
  },
  {
    label: '-9:00',
    description: 'America/Anchorage',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'America/Anchorage (DST)',
    offset: -28800,
  },
  {
    label: '-9:00',
    description: 'America/Juneau',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'America/Juneau (DST)',
    offset: -28800,
  },
  {
    label: '-9:00',
    description: 'America/Nome',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'America/Nome (DST)',
    offset: -28800,
  },
  {
    label: '-9:00',
    description: 'America/Sitka',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'America/Sitka (DST)',
    offset: -28800,
  },
  {
    label: '-9:00',
    description: 'America/Yakutat',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'America/Yakutat (DST)',
    offset: -28800,
  },
  {
    label: '-9:00',
    description: 'Etc/GMT+9',
    offset: -32400,
  },
  {
    label: '-9:00',
    description: 'Pacific/Gambier',
    offset: -32400,
  },
  {
    label: '-9:00',
    description: 'US/Alaska',
    offset: -32400,
  },
  {
    label: '-8:00',
    description: 'US/Alaska (DST)',
    offset: -28800,
  },
  {
    label: '-8:00',
    description: 'America/Dawson',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Dawson (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Ensenada',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Ensenada (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Los Angeles',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Los Angeles (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Metlakatla',
    offset: -28800,
  },
  {
    label: '-8:00',
    description: 'America/Santa Isabel',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Santa Isabel (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Tijuana',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Tijuana (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Vancouver',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Vancouver (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'America/Whitehorse',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'America/Whitehorse (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'Canada/Pacific',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'Canada/Pacific (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'Canada/Yukon',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'Canada/Yukon (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'Etc/GMT+8',
    offset: -28800,
  },
  {
    label: '-8:00',
    description: 'Mexico/BajaNorte',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'Mexico/BajaNorte (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'Pacific/Pitcairn',
    offset: -28800,
  },
  {
    label: '-8:00',
    description: 'US/Pacific',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'US/Pacific (DST)',
    offset: -25200,
  },
  {
    label: '-8:00',
    description: 'US/Pacific-New',
    offset: -28800,
  },
  {
    label: '-7:00',
    description: 'US/Pacific-New (DST)',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Boise',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Boise (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Cambridge Bay',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Cambridge Bay (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Chihuahua',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Chihuahua (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Creston',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Dawson Creek',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Denver',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Denver (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Edmonton',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Edmonton (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Fort Nelson',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Hermosillo',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Inuvik',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Inuvik (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Mazatlan',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Mazatlan (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Ojinaga',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Ojinaga (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Phoenix',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'America/Shiprock',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Shiprock (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'America/Yellowknife',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'America/Yellowknife (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'Canada/Mountain',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'Canada/Mountain (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'Etc/GMT+7',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'MST',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'MST7MDT',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'MST7MDT (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'Mexico/BajaSur',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'Mexico/BajaSur (DST)',
    offset: -21600,
  },
  {
    label: '-7:00',
    description: 'US/Arizona',
    offset: -25200,
  },
  {
    label: '-7:00',
    description: 'US/Mountain',
    offset: -25200,
  },
  {
    label: '-6:00',
    description: 'US/Mountain (DST)',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Bahia Banderas',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Bahia Banderas (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Belize',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Chicago',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Chicago (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Costa Rica',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/El Salvador',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Guatemala',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Indiana/Knox',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Knox (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Indiana/Tell City',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Tell City (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Knox IN',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Knox IN (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Managua',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Matamoros',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Matamoros (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Menominee',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Menominee (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Merida',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Merida (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Mexico City',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Mexico City (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Monterrey',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Monterrey (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/North Dakota/Beulah',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/North Dakota/Beulah (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/North Dakota/Center',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/North Dakota/Center (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/North Dakota/New Salem',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/North Dakota/New Salem (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Rainy River',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Rainy River (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Rankin Inlet',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Rankin Inlet (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Regina',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Resolute',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Resolute (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'America/Swift Current',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Tegucigalpa',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'America/Winnipeg',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'America/Winnipeg (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'CST6CDT',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'CST6CDT (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'Canada/Central',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'Canada/Central (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'Canada/East-Saskatchewan',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'Canada/Saskatchewan',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'Etc/GMT+6',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'Mexico/General',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'Mexico/General (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'Pacific/Galapagos',
    offset: -21600,
  },
  {
    label: '-6:00',
    description: 'US/Central',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'US/Central (DST)',
    offset: -18000,
  },
  {
    label: '-6:00',
    description: 'US/Indiana-Starke',
    offset: -21600,
  },
  {
    label: '-5:00',
    description: 'US/Indiana-Starke (DST)',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Atikokan',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Bogota',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Cancun',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Cayman',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Coral Harbour',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Detroit',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Detroit (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Eirunepe',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Fort Wayne',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Fort Wayne (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Guayaquil',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Havana',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Havana (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Indianapolis',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Indianapolis (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Marengo',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Marengo (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Petersburg',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Petersburg (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Vevay',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Vevay (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Vincennes',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Vincennes (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indiana/Winamac',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indiana/Winamac (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Indianapolis',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Indianapolis (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Iqaluit',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Iqaluit (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Jamaica',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Kentucky/Louisville',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Kentucky/Louisville (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Kentucky/Monticello',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Kentucky/Monticello (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Lima',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Louisville',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Louisville (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Montreal',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Montreal (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Nassau',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Nassau (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/New York',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/New York (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Nipigon',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Nipigon (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Panama',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Pangnirtung',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Pangnirtung (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Port-au-Prince',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Port-au-Prince (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Porto Acre',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Rio Branco',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'America/Thunder Bay',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Thunder Bay (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'America/Toronto',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'America/Toronto (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'Brazil/Acre',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'Canada/Eastern',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'Canada/Eastern (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'Chile/EasterIsland',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'Cuba',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'Cuba (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'EST',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'EST5EDT',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'EST5EDT (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'Etc/GMT+5',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'Jamaica',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'Pacific/Easter',
    offset: -18000,
  },
  {
    label: '-5:00',
    description: 'US/East-Indiana',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'US/East-Indiana (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'US/Eastern',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'US/Eastern (DST)',
    offset: -14400,
  },
  {
    label: '-5:00',
    description: 'US/Michigan',
    offset: -18000,
  },
  {
    label: '-4:00',
    description: 'US/Michigan (DST)',
    offset: -14400,
  },
  {
    label: '-4:30',
    description: 'America/Caracas',
    offset: -16200,
  },
  {
    label: '-4:00',
    description: 'America/Anguilla',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Antigua',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Aruba',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Barbados',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Blanc-Sablon',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Boa Vista',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Campo Grande',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Campo Grande (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Cuiaba',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Cuiaba (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Curacao',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Dominica',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Glace Bay',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Glace Bay (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Goose Bay',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Goose Bay (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Grand Turk',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Grenada',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Guadeloupe',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Guyana',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Halifax',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Halifax (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Kralendijk',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/La Paz',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Lower Princes',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Manaus',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Marigot',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Martinique',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Moncton',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Moncton (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Montserrat',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Port of Spain',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Porto Velho',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Puerto Rico',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Santo Domingo',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/St Barthelemy',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/St Kitts',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/St Lucia',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/St Thomas',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/St Vincent',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Thule',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'America/Thule (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'America/Tortola',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'America/Virgin',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'Atlantic/Bermuda',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'Atlantic/Bermuda (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'Brazil/West',
    offset: -14400,
  },
  {
    label: '-4:00',
    description: 'Canada/Atlantic',
    offset: -14400,
  },
  {
    label: '-3:00',
    description: 'Canada/Atlantic (DST)',
    offset: -10800,
  },
  {
    label: '-4:00',
    description: 'Etc/GMT+4',
    offset: -14400,
  },
  {
    label: '-3:30',
    description: 'America/St Johns',
    offset: -12600,
  },
  {
    label: '-2:30',
    description: 'America/St Johns (DST)',
    offset: -9000,
  },
  {
    label: '-3:30',
    description: 'Canada/Newfoundland',
    offset: -12600,
  },
  {
    label: '-2:30',
    description: 'Canada/Newfoundland (DST)',
    offset: -9000,
  },
  {
    label: '-3:00',
    description: 'America/Araguaina',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Buenos Aires',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Catamarca',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/ComodRivadavia',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Cordoba',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Jujuy',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/La Rioja',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Mendoza',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Rio Gallegos',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Salta',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/San Juan',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/San Luis',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Tucuman',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Argentina/Ushuaia',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Asuncion',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Bahia',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Belem',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Buenos Aires',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Catamarca',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Cayenne',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Cordoba',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Fortaleza',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Godthab',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'America/Godthab (DST)',
    offset: -7200,
  },
  {
    label: '-3:00',
    description: 'America/Jujuy',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Maceio',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Mendoza',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Miquelon',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'America/Miquelon (DST)',
    offset: -7200,
  },
  {
    label: '-3:00',
    description: 'America/Montevideo',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'America/Montevideo (DST)',
    offset: -7200,
  },
  {
    label: '-3:00',
    description: 'America/Paramaribo',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Recife',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Rosario',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Santarem',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Santiago',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'America/Sao Paulo',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'America/Sao Paulo (DST)',
    offset: -7200,
  },
  {
    label: '-3:00',
    description: 'Antarctica/Palmer',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'Antarctica/Rothera',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'Atlantic/Stanley',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'Brazil/East',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'Brazil/East (DST)',
    offset: -7200,
  },
  {
    label: '-3:00',
    description: 'Chile/Continental',
    offset: -10800,
  },
  {
    label: '-3:00',
    description: 'Etc/GMT+3',
    offset: -10800,
  },
  {
    label: '-2:00',
    description: 'America/Noronha',
    offset: -7200,
  },
  {
    label: '-2:00',
    description: 'Atlantic/South Georgia',
    offset: -7200,
  },
  {
    label: '-2:00',
    description: 'Brazil/DeNoronha',
    offset: -7200,
  },
  {
    label: '-2:00',
    description: 'Etc/GMT+2',
    offset: -7200,
  },
  {
    label: '-1:00',
    description: 'America/Scoresbysund',
    offset: -3600,
  },
  {
    label: '\u00b10:00',
    description: 'America/Scoresbysund (DST)',
    offset: 0,
  },
  {
    label: '-1:00',
    description: 'Atlantic/Azores',
    offset: -3600,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Azores (DST)',
    offset: 0,
  },
  {
    label: '-1:00',
    description: 'Atlantic/Cape Verde',
    offset: -3600,
  },
  {
    label: '-1:00',
    description: 'Etc/GMT+1',
    offset: -3600,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Abidjan',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Accra',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Bamako',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Banjul',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Bissau',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Casablanca',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Africa/Casablanca (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Conakry',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Dakar',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/El Aaiun',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Africa/El Aaiun (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Freetown',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Lome',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Monrovia',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Nouakchott',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Ouagadougou',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Sao Tome',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Africa/Timbuktu',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'America/Danmarkshavn',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Antarctica/Troll',
    offset: 0,
  },
  {
    label: '+2:00',
    description: 'Antarctica/Troll (DST)',
    offset: 7200,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Canary',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Atlantic/Canary (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Faeroe',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Atlantic/Faeroe (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Faroe',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Atlantic/Faroe (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Madeira',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Atlantic/Madeira (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/Reykjavik',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Atlantic/St Helena',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Eire',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Eire (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/GMT',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/GMT+0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/GMT-0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/GMT0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/Greenwich',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/UCT',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/UTC',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/Universal',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Etc/Zulu',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Belfast',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Belfast (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Dublin',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Dublin (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Guernsey',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Guernsey (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Isle of Man',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Isle of Man (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Jersey',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Jersey (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/Lisbon',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/Lisbon (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Europe/London',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Europe/London (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Factory',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'GB',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'GB (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'GB-Eire',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'GB-Eire (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'GMT',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'GMT+0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'GMT-0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'GMT0',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Greenwich',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Iceland',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Mideast/Riyadh87',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Mideast/Riyadh88',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Mideast/Riyadh89',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Navajo',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'PRC',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'PST8PDT',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Portugal',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Portugal (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'UCT',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'UTC',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'Universal',
    offset: 0,
  },
  {
    label: '\u00b10:00',
    description: 'WET',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'WET (DST)',
    offset: 3600,
  },
  {
    label: '\u00b10:00',
    description: 'Zulu',
    offset: 0,
  },
  {
    label: '+1:00',
    description: 'Africa/Algiers',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Bangui',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Brazzaville',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Ceuta',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Africa/Ceuta (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Africa/Douala',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Kinshasa',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Lagos',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Libreville',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Luanda',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Malabo',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Ndjamena',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Niamey',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Porto-Novo',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Tunis',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Africa/Windhoek',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Africa/Windhoek (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Arctic/Longyearbyen',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Arctic/Longyearbyen (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Atlantic/Jan Mayen',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Atlantic/Jan Mayen (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'CET',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'CET (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Etc/GMT-1',
    offset: 3600,
  },
  {
    label: '+1:00',
    description: 'Europe/Amsterdam',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Amsterdam (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Andorra',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Andorra (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Belgrade',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Belgrade (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Berlin',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Berlin (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Bratislava',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Bratislava (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Brussels',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Brussels (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Budapest',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Budapest (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Busingen',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Busingen (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Copenhagen',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Copenhagen (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Gibraltar',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Gibraltar (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Ljubljana',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Ljubljana (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Luxembourg',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Luxembourg (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Madrid',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Madrid (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Malta',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Malta (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Monaco',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Monaco (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Oslo',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Oslo (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Paris',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Paris (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Podgorica',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Podgorica (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Prague',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Prague (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Rome',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Rome (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/San Marino',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/San Marino (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Sarajevo',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Sarajevo (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Skopje',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Skopje (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Stockholm',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Stockholm (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Tirane',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Tirane (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Vaduz',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Vaduz (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Vatican',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Vatican (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Vienna',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Vienna (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Warsaw',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Warsaw (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Zagreb',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Zagreb (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Europe/Zurich',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Europe/Zurich (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'MET',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'MET (DST)',
    offset: 7200,
  },
  {
    label: '+1:00',
    description: 'Poland',
    offset: 3600,
  },
  {
    label: '+2:00',
    description: 'Poland (DST)',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Blantyre',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Bujumbura',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Cairo',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Gaborone',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Harare',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Johannesburg',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Kigali',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Lubumbashi',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Lusaka',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Maputo',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Maseru',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Mbabane',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Africa/Tripoli',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Asia/Amman',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Amman (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Beirut',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Beirut (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Damascus',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Damascus (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Gaza',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Gaza (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Hebron',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Hebron (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Istanbul',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Istanbul (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Jerusalem',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Jerusalem (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Nicosia',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Nicosia (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Asia/Tel Aviv',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Asia/Tel Aviv (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'EET',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'EET (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Egypt',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Etc/GMT-2',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Europe/Athens',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Athens (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Bucharest',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Bucharest (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Chisinau',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Chisinau (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Helsinki',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Helsinki (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Istanbul',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Istanbul (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Kaliningrad',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Kaliningrad (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Kiev',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Kiev (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Mariehamn',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Mariehamn (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Nicosia',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Nicosia (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Riga',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Riga (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Simferopol',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Simferopol (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Sofia',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Sofia (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Tallinn',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Tallinn (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Tiraspol',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Tiraspol (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Uzhgorod',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Uzhgorod (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Vilnius',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Vilnius (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Europe/Zaporozhye',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Europe/Zaporozhye (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Israel',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Israel (DST)',
    offset: 10800,
  },
  {
    label: '+2:00',
    description: 'Libya',
    offset: 7200,
  },
  {
    label: '+2:00',
    description: 'Turkey',
    offset: 7200,
  },
  {
    label: '+3:00',
    description: 'Turkey (DST)',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Addis Ababa',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Asmara',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Asmera',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Dar es Salaam',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Djibouti',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Juba',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Kampala',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Khartoum',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Mogadishu',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Africa/Nairobi',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Antarctica/Syowa',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Aden',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Baghdad',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Bahrain',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Kuwait',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Qatar',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Riyadh',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Riyadh87',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Riyadh88',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Asia/Riyadh89',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Etc/GMT-3',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Europe/Minsk',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Europe/Moscow',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Europe/Volgograd',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Indian/Antananarivo',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Indian/Comoro',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'Indian/Mayotte',
    offset: 10800,
  },
  {
    label: '+3:00',
    description: 'W-SU',
    offset: 10800,
  },
  {
    label: '+3:30',
    description: 'Asia/Tehran',
    offset: 12600,
  },
  {
    label: '+4:30',
    description: 'Asia/Tehran (DST)',
    offset: 16200,
  },
  {
    label: '+3:30',
    description: 'Iran',
    offset: 12600,
  },
  {
    label: '+4:30',
    description: 'Iran (DST)',
    offset: 16200,
  },
  {
    label: '+4:00',
    description: 'Asia/Baku',
    offset: 14400,
  },
  {
    label: '+5:00',
    description: 'Asia/Baku (DST)',
    offset: 18000,
  },
  {
    label: '+4:00',
    description: 'Asia/Dubai',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Asia/Muscat',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Asia/Tbilisi',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Asia/Yerevan',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Etc/GMT-4',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Europe/Samara',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Indian/Mahe',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Indian/Mauritius',
    offset: 14400,
  },
  {
    label: '+4:00',
    description: 'Indian/Reunion',
    offset: 14400,
  },
  {
    label: '+4:30',
    description: 'Asia/Kabul',
    offset: 16200,
  },
  {
    label: '+5:00',
    description: 'Antarctica/Mawson',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Aqtau',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Aqtobe',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Ashgabat',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Ashkhabad',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Dushanbe',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Karachi',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Oral',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Samarkand',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Tashkent',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Asia/Yekaterinburg',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Etc/GMT-5',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Indian/Kerguelen',
    offset: 18000,
  },
  {
    label: '+5:00',
    description: 'Indian/Maldives',
    offset: 18000,
  },
  {
    label: '+5:30',
    description: 'Asia/Calcutta',
    offset: 19800,
  },
  {
    label: '+5:30',
    description: 'Asia/Colombo',
    offset: 19800,
  },
  {
    label: '+5:30',
    description: 'Asia/Kolkata',
    offset: 19800,
  },
  {
    label: '+5:45',
    description: 'Asia/Kathmandu',
    offset: 20700,
  },
  {
    label: '+5:45',
    description: 'Asia/Katmandu',
    offset: 20700,
  },
  {
    label: '+6:00',
    description: 'Antarctica/Vostok',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Almaty',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Bishkek',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Dacca',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Dhaka',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Kashgar',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Novosibirsk',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Omsk',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Qyzylorda',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Thimbu',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Thimphu',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Asia/Urumqi',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Etc/GMT-6',
    offset: 21600,
  },
  {
    label: '+6:00',
    description: 'Indian/Chagos',
    offset: 21600,
  },
  {
    label: '+6:30',
    description: 'Asia/Rangoon',
    offset: 23400,
  },
  {
    label: '+6:30',
    description: 'Indian/Cocos',
    offset: 23400,
  },
  {
    label: '+7:00',
    description: 'Antarctica/Davis',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Bangkok',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Ho Chi Minh',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Hovd',
    offset: 25200,
  },
  {
    label: '+8:00',
    description: 'Asia/Hovd (DST)',
    offset: 28800,
  },
  {
    label: '+7:00',
    description: 'Asia/Jakarta',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Krasnoyarsk',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Novokuznetsk',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Phnom Penh',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Pontianak',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Saigon',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Asia/Vientiane',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Etc/GMT-7',
    offset: 25200,
  },
  {
    label: '+7:00',
    description: 'Indian/Christmas',
    offset: 25200,
  },
  {
    label: '+8:00',
    description: 'Antarctica/Casey',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Brunei',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Chita',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Choibalsan',
    offset: 28800,
  },
  {
    label: '+9:00',
    description: 'Asia/Choibalsan (DST)',
    offset: 32400,
  },
  {
    label: '+8:00',
    description: 'Asia/Chongqing',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Chungking',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Harbin',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Hong Kong',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Irkutsk',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Kuala Lumpur',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Kuching',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Macao',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Macau',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Makassar',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Manila',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Shanghai',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Singapore',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Taipei',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Ujung Pandang',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Asia/Ulaanbaatar',
    offset: 28800,
  },
  {
    label: '+9:00',
    description: 'Asia/Ulaanbaatar (DST)',
    offset: 32400,
  },
  {
    label: '+8:00',
    description: 'Asia/Ulan Bator',
    offset: 28800,
  },
  {
    label: '+9:00',
    description: 'Asia/Ulan Bator (DST)',
    offset: 32400,
  },
  {
    label: '+8:00',
    description: 'Australia/Perth',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Australia/West',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Etc/GMT-8',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Hongkong',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'ROC',
    offset: 28800,
  },
  {
    label: '+8:00',
    description: 'Singapore',
    offset: 28800,
  },
  {
    label: '+8:30',
    description: 'Asia/Pyongyang',
    offset: 30600,
  },
  {
    label: '+8:45',
    description: 'Australia/Eucla',
    offset: 31500,
  },
  {
    label: '+9:00',
    description: 'Asia/Dili',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Asia/Jayapura',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Asia/Khandyga',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Asia/Seoul',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Asia/Tokyo',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Asia/Yakutsk',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Etc/GMT-9',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Japan',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'Pacific/Palau',
    offset: 32400,
  },
  {
    label: '+9:00',
    description: 'ROK',
    offset: 32400,
  },
  {
    label: '+9:30',
    description: 'Australia/Adelaide',
    offset: 34200,
  },
  {
    label: '+10:30',
    description: 'Australia/Adelaide (DST)',
    offset: 37800,
  },
  {
    label: '+9:30',
    description: 'Australia/Broken Hill',
    offset: 34200,
  },
  {
    label: '+10:30',
    description: 'Australia/Broken Hill (DST)',
    offset: 37800,
  },
  {
    label: '+9:30',
    description: 'Australia/Darwin',
    offset: 34200,
  },
  {
    label: '+9:30',
    description: 'Australia/North',
    offset: 34200,
  },
  {
    label: '+9:30',
    description: 'Australia/South',
    offset: 34200,
  },
  {
    label: '+10:30',
    description: 'Australia/South (DST)',
    offset: 37800,
  },
  {
    label: '+9:30',
    description: 'Australia/Yancowinna',
    offset: 34200,
  },
  {
    label: '+10:30',
    description: 'Australia/Yancowinna (DST)',
    offset: 37800,
  },
  {
    label: '+10:00',
    description: 'Antarctica/DumontDUrville',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Asia/Magadan',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Asia/Sakhalin',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Asia/Vladivostok',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Australia/ACT',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/ACT (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Brisbane',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Australia/Canberra',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Canberra (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Currie',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Currie (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Hobart',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Hobart (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Lindeman',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Australia/Melbourne',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Melbourne (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/NSW',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/NSW (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Queensland',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Australia/Sydney',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Sydney (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Tasmania',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Tasmania (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Australia/Victoria',
    offset: 36000,
  },
  {
    label: '+11:00',
    description: 'Australia/Victoria (DST)',
    offset: 39600,
  },
  {
    label: '+10:00',
    description: 'Etc/GMT-10',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Chuuk',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Guam',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Port Moresby',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Saipan',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Truk',
    offset: 36000,
  },
  {
    label: '+10:00',
    description: 'Pacific/Yap',
    offset: 36000,
  },
  {
    label: '+10:30',
    description: 'Australia/LHI',
    offset: 37800,
  },
  {
    label: '+11:00',
    description: 'Australia/LHI (DST)',
    offset: 39600,
  },
  {
    label: '+10:30',
    description: 'Australia/Lord Howe',
    offset: 37800,
  },
  {
    label: '+11:00',
    description: 'Australia/Lord Howe (DST)',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Antarctica/Macquarie',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Asia/Srednekolymsk',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Etc/GMT-11',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Bougainville',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Efate',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Guadalcanal',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Kosrae',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Norfolk',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Noumea',
    offset: 39600,
  },
  {
    label: '+11:00',
    description: 'Pacific/Ponape',
    offset: 39600,
  },
  {
    label: '+12:00',
    description: 'Antarctica/McMurdo',
    offset: 43200,
  },
  {
    label: '+13:00',
    description: 'Antarctica/McMurdo (DST)',
    offset: 46800,
  },
  {
    label: '+12:00',
    description: 'Antarctica/South Pole',
    offset: 43200,
  },
  {
    label: '+13:00',
    description: 'Antarctica/South Pole (DST)',
    offset: 46800,
  },
  {
    label: '+12:00',
    description: 'Asia/Anadyr',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Asia/Kamchatka',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Etc/GMT-12',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Kwajalein',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'NZ',
    offset: 43200,
  },
  {
    label: '+13:00',
    description: 'NZ (DST)',
    offset: 46800,
  },
  {
    label: '+12:00',
    description: 'Pacific/Auckland',
    offset: 43200,
  },
  {
    label: '+13:00',
    description: 'Pacific/Auckland (DST)',
    offset: 46800,
  },
  {
    label: '+12:00',
    description: 'Pacific/Fiji',
    offset: 43200,
  },
  {
    label: '+13:00',
    description: 'Pacific/Fiji (DST)',
    offset: 46800,
  },
  {
    label: '+12:00',
    description: 'Pacific/Funafuti',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Kwajalein',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Majuro',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Nauru',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Tarawa',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Wake',
    offset: 43200,
  },
  {
    label: '+12:00',
    description: 'Pacific/Wallis',
    offset: 43200,
  },
  {
    label: '+12:45',
    description: 'NZ-CHAT',
    offset: 45900,
  },
  {
    label: '+13:45',
    description: 'NZ-CHAT (DST)',
    offset: 49500,
  },
  {
    label: '+12:45',
    description: 'Pacific/Chatham',
    offset: 45900,
  },
  {
    label: '+13:45',
    description: 'Pacific/Chatham (DST)',
    offset: 49500,
  },
  {
    label: '+13:00',
    description: 'Etc/GMT-13',
    offset: 46800,
  },
  {
    label: '+13:00',
    description: 'Pacific/Apia',
    offset: 46800,
  },
  {
    label: '+14:00',
    description: 'Pacific/Apia (DST)',
    offset: 50400,
  },
  {
    label: '+13:00',
    description: 'Pacific/Enderbury',
    offset: 46800,
  },
  {
    label: '+13:00',
    description: 'Pacific/Fakaofo',
    offset: 46800,
  },
  {
    label: '+13:00',
    description: 'Pacific/Tongatapu',
    offset: 46800,
  },
  {
    label: '+14:00',
    description: 'Etc/GMT-14',
    offset: 50400,
  },
  {
    label: '+14:00',
    description: 'Pacific/Kiritimati',
    offset: 50400,
  },
];
