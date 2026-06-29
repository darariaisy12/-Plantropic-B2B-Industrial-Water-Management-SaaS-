import { describe, expect, test } from 'vitest';
import { scoreElement } from '../scoring';

describe('scoreElement — qualitative elements', () => {
  test('S2 averages its yes/no answers', () => {
    expect(
      scoreElement('S2', {
        no_child_labor: 'Ya',
        freedom_of_association: 'Ya',
        min_wage_compliance: 'Ya',
      }).score,
    ).toBe(100);
    expect(
      scoreElement('S2', {
        no_child_labor: 'Tidak',
        freedom_of_association: 'Tidak',
        min_wage_compliance: 'Tidak',
      }).score,
    ).toBe(0);
    expect(
      scoreElement('S2', {
        no_child_labor: 'Ya',
        freedom_of_association: 'Tidak',
        min_wage_compliance: 'Ya',
      }).score,
    ).toBeCloseTo(66.7, 1);
  });

  test('E5 maps maturity options to their scores', () => {
    // avg(Sebagian=50, Ya=100)
    expect(
      scoreElement('E5', {
        emission_monitoring: 'Sebagian',
        air_quality_compliance: 'Ya',
      }).score,
    ).toBe(75);
  });

  test('unknown or missing qualitative answer scores 0', () => {
    expect(scoreElement('S2', {}).score).toBe(0);
    expect(
      scoreElement('S2', {
        no_child_labor: 'Mungkin',
        freedom_of_association: 'Ya',
        min_wage_compliance: 'Ya',
      }).score,
    ).toBeCloseTo(66.7, 1);
  });
});

describe('scoreElement — S3 diversity against benchmarks', () => {
  test('scores workforce % against BPS 38% target and management % against GRI 30% target', () => {
    // 40% workforce > 38% target → capped at 100; 20% management / 30% = 66.7 → avg 83.3
    expect(
      scoreElement('S3', { women_workforce_pct: 40, women_management_pct: 20 }).score,
    ).toBeCloseTo(83.3, 1);
  });

  test('meeting or exceeding both targets caps at 100', () => {
    expect(
      scoreElement('S3', { women_workforce_pct: 38, women_management_pct: 30 }).score,
    ).toBe(100);
    expect(
      scoreElement('S3', { women_workforce_pct: 100, women_management_pct: 100 }).score,
    ).toBe(100);
  });

  test('zero diversity scores 0', () => {
    expect(
      scoreElement('S3', { women_workforce_pct: 0, women_management_pct: 0 }).score,
    ).toBe(0);
  });
});

describe('scoreElement — E2 blends recovery with B3 handling', () => {
  test('full recovery with licensed B3 scores 100', () => {
    expect(
      scoreElement('E2', {
        waste_total_ton: 100,
        waste_recycled_ton: 100,
        b3_licensed_handler: 'Ya',
      }).score,
    ).toBe(100);
  });

  test('full recovery but unlicensed B3 is penalised', () => {
    // avg(recovery=100, b3=0)
    expect(
      scoreElement('E2', {
        waste_total_ton: 100,
        waste_recycled_ton: 100,
        b3_licensed_handler: 'Tidak',
      }).score,
    ).toBe(50);
  });
});

describe('scoreElement — S1 safety rate', () => {
  test('zero accidents with hours and full K3 system scores 100', () => {
    expect(
      scoreElement('S1', {
        accidents_count: 0,
        workhours_total: 200000,
        k3_management_system: 'Lengkap & terdokumentasi',
      }).score,
    ).toBe(100);
  });

  test('high injury frequency drags the score down', () => {
    const safe = scoreElement('S1', {
      accidents_count: 0,
      workhours_total: 1_000_000,
      k3_management_system: 'Lengkap & terdokumentasi',
    }).score;
    const unsafe = scoreElement('S1', {
      accidents_count: 30,
      workhours_total: 1_000_000,
      k3_management_system: 'Lengkap & terdokumentasi',
    }).score;
    expect(unsafe).toBeLessThan(safe);
  });
});

describe('scoreElement — G3 legal violations', () => {
  test('no violations with full compliance system scores 100', () => {
    expect(
      scoreElement('G3', {
        legal_violations_count: 0,
        compliance_management: 'Lengkap & terdokumentasi',
      }).score,
    ).toBe(100);
  });

  test('many violations floor the violation sub-score', () => {
    const dirty = scoreElement('G3', {
      legal_violations_count: 10,
      compliance_management: 'Belum ada',
    }).score;
    expect(dirty).toBe(0);
  });
});
