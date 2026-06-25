/**
 * The Plantropic ESG framework: 14 elements across Environment, Social, and
 * Governance, each anchored to a GRI standard (and Indonesian regulation where
 * relevant). Derived from the curated reference set in `jurnal/`.
 *
 * This module only declares WHICH data to collect per element. HOW each element
 * is scored lives in the calculators/scoring layer:
 *   - quantitative indicators  -> formula-based (emission factors, ratios)
 *   - qualitative indicators    -> the option `score` values below
 *
 * Indicator sets are intentionally a defensible starting point, not exhaustive;
 * they can be extended without changing the engine contract.
 */

import type { ElementDefinition, QualitativeOption } from './types';

const YES_NO: QualitativeOption[] = [
  { label: 'Ya', score: 100 },
  { label: 'Tidak', score: 0 },
];

const MATURITY: QualitativeOption[] = [
  { label: 'Belum ada', score: 0 },
  { label: 'Sebagian', score: 50 },
  { label: 'Lengkap & terdokumentasi', score: 100 },
];

export const ESG_FRAMEWORK: readonly ElementDefinition[] = [
  // ── ENVIRONMENT ──────────────────────────────────────────────────────────
  {
    id: 'E1',
    pillar: 'E',
    name: 'Emisi Gas Rumah Kaca',
    griAnchor: 'GRI 305',
    indicators: [
      { id: 'electricity_kwh', label: 'Konsumsi listrik', kind: 'quantitative', unit: 'kWh' },
      { id: 'diesel_l', label: 'Konsumsi solar', kind: 'quantitative', unit: 'L' },
      { id: 'gasoline_l', label: 'Konsumsi bensin', kind: 'quantitative', unit: 'L' },
      { id: 'natural_gas_m3', label: 'Konsumsi gas alam', kind: 'quantitative', unit: 'm³' },
    ],
  },
  {
    id: 'E2',
    pillar: 'E',
    name: 'Pengelolaan Limbah Padat',
    griAnchor: 'GRI 306',
    regulation: 'PP 22/2021',
    indicators: [
      { id: 'waste_total_ton', label: 'Total limbah dihasilkan', kind: 'quantitative', unit: 'ton' },
      { id: 'waste_recycled_ton', label: 'Limbah didaur ulang', kind: 'quantitative', unit: 'ton' },
      { id: 'waste_b3_ton', label: 'Limbah B3', kind: 'quantitative', unit: 'ton' },
      { id: 'b3_licensed_handler', label: 'Limbah B3 dikelola pihak berizin', kind: 'qualitative', options: YES_NO },
    ],
  },
  {
    id: 'E3',
    pillar: 'E',
    name: 'Penggunaan Energi',
    griAnchor: 'GRI 302',
    regulation: 'ISO 50001',
    indicators: [
      { id: 'energy_total_kwh', label: 'Total energi dikonsumsi', kind: 'quantitative', unit: 'kWh' },
      { id: 'renewable_kwh', label: 'Energi terbarukan', kind: 'quantitative', unit: 'kWh' },
      { id: 'production_output_ton', label: 'Output produksi (untuk intensitas)', kind: 'quantitative', unit: 'ton' },
    ],
  },
  {
    id: 'E4',
    pillar: 'E',
    name: 'Penggunaan Bahan Baku',
    griAnchor: 'GRI 301',
    indicators: [
      { id: 'material_total_ton', label: 'Total bahan baku', kind: 'quantitative', unit: 'ton' },
      { id: 'material_recycled_ton', label: 'Bahan baku daur ulang', kind: 'quantitative', unit: 'ton' },
    ],
  },
  {
    id: 'E5',
    pillar: 'E',
    name: 'Polusi Udara',
    griAnchor: 'GRI 305',
    indicators: [
      { id: 'emission_monitoring', label: 'Pemantauan emisi udara', kind: 'qualitative', options: MATURITY },
      { id: 'air_quality_compliance', label: 'Memenuhi baku mutu udara', kind: 'qualitative', options: YES_NO },
    ],
  },

  // ── SOCIAL ───────────────────────────────────────────────────────────────
  {
    id: 'S1',
    pillar: 'S',
    name: 'Keselamatan & Kesehatan Kerja',
    griAnchor: 'GRI 403',
    regulation: 'ISO 45001',
    indicators: [
      { id: 'accidents_count', label: 'Jumlah kecelakaan kerja', kind: 'quantitative', unit: 'kasus' },
      { id: 'workhours_total', label: 'Total jam kerja', kind: 'quantitative', unit: 'jam' },
      { id: 'k3_management_system', label: 'Sistem manajemen K3', kind: 'qualitative', options: MATURITY },
    ],
  },
  {
    id: 'S2',
    pillar: 'S',
    name: 'Hak-hak Tenaga Kerja',
    griAnchor: 'GRI 408/409',
    indicators: [
      { id: 'no_child_labor', label: 'Bebas pekerja anak', kind: 'qualitative', options: YES_NO },
      { id: 'freedom_of_association', label: 'Kebebasan berserikat', kind: 'qualitative', options: YES_NO },
      { id: 'min_wage_compliance', label: 'Patuh upah minimum', kind: 'qualitative', options: YES_NO },
    ],
  },
  {
    id: 'S3',
    pillar: 'S',
    name: 'Diversitas & Inklusi',
    griAnchor: 'GRI 405',
    indicators: [
      { id: 'women_workforce_pct', label: 'Persentase tenaga kerja perempuan', kind: 'quantitative', unit: '%' },
      { id: 'women_management_pct', label: 'Persentase perempuan di manajemen', kind: 'quantitative', unit: '%' },
    ],
  },
  {
    id: 'S4',
    pillar: 'S',
    name: 'Dampak terhadap Masyarakat',
    griAnchor: 'GRI 413',
    indicators: [
      { id: 'community_program', label: 'Program pemberdayaan masyarakat', kind: 'qualitative', options: MATURITY },
      { id: 'grievance_mechanism', label: 'Mekanisme pengaduan masyarakat', kind: 'qualitative', options: YES_NO },
    ],
  },
  {
    id: 'S5',
    pillar: 'S',
    name: 'Kepuasan Pelanggan',
    griAnchor: 'GRI 417',
    indicators: [
      { id: 'customer_satisfaction_pct', label: 'Tingkat kepuasan pelanggan', kind: 'quantitative', unit: '%' },
      { id: 'complaint_handling_system', label: 'Sistem penanganan keluhan', kind: 'qualitative', options: MATURITY },
    ],
  },

  // ── GOVERNANCE ───────────────────────────────────────────────────────────
  {
    id: 'G1',
    pillar: 'G',
    name: 'Struktur & Etika Bisnis',
    griAnchor: 'GRI 102',
    indicators: [
      { id: 'code_of_conduct', label: 'Kode etik bisnis', kind: 'qualitative', options: MATURITY },
      { id: 'board_independence', label: 'Ada dewan/komisaris independen', kind: 'qualitative', options: YES_NO },
    ],
  },
  {
    id: 'G2',
    pillar: 'G',
    name: 'Anti-Korupsi',
    griAnchor: 'GRI 205',
    indicators: [
      { id: 'anticorruption_policy', label: 'Kebijakan anti-korupsi', kind: 'qualitative', options: MATURITY },
      { id: 'anticorruption_training_pct', label: 'Karyawan dilatih anti-korupsi', kind: 'quantitative', unit: '%' },
    ],
  },
  {
    id: 'G3',
    pillar: 'G',
    name: 'Kepatuhan Hukum',
    griAnchor: 'GRI 206',
    indicators: [
      { id: 'legal_violations_count', label: 'Jumlah pelanggaran hukum', kind: 'quantitative', unit: 'kasus' },
      { id: 'compliance_management', label: 'Sistem manajemen kepatuhan', kind: 'qualitative', options: MATURITY },
    ],
  },
  {
    id: 'G4',
    pillar: 'G',
    name: 'Manajemen Risiko',
    griAnchor: 'GRI 201',
    regulation: 'ISO 31000',
    indicators: [
      { id: 'risk_management_system', label: 'Sistem manajemen risiko', kind: 'qualitative', options: MATURITY },
      { id: 'climate_risk_assessment', label: 'Penilaian risiko iklim', kind: 'qualitative', options: YES_NO },
    ],
  },
];

/** Lookup an element definition by id. */
export function getElement(id: ElementDefinition['id']): ElementDefinition {
  const element = ESG_FRAMEWORK.find((e) => e.id === id);
  if (!element) {
    throw new Error(`Unknown ESG element: ${id}`);
  }
  return element;
}
