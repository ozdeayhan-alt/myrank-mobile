import { useCallback, useState } from "react";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { EMPTY_METADATA, type UserMetadata } from "@/features/profile/types";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import { getFieldConfig, type FilterFieldKey } from "../config/filterFields";
import { applyFieldValue } from "../utils/applyFieldValue";

/** Türkiye odaklı başlangıç: keşfet ve sıralama sekmeleri için varsayılan ülke filtresi */
export const DEFAULT_COUNTRY_FILTERS: UserMetadata = {
  ...EMPTY_METADATA,
  country: "Türkiye",
};

/** @deprecated Use DEFAULT_COUNTRY_FILTERS */
export const RANKING_DEFAULT_FILTERS = DEFAULT_COUNTRY_FILTERS;

type UseMetadataFiltersOptions = {
  initialFilters?: UserMetadata | null;
};

export function useMetadataFilters(options: UseMetadataFiltersOptions = {}) {
  const { initialFilters = null } = options;
  const profileMetadata = useProfileStore((s) => s.metadata);
  /** `initialFilters` yoksa global (filtresiz); keşfet/sıralama `DEFAULT_COUNTRY_FILTERS` ile başlar */
  const [filters, setFilters] = useState<UserMetadata | null>(initialFilters);
  const [activeField, setActiveField] = useState<FilterFieldKey | null>(null);

  const openField = useCallback((field: FilterFieldKey) => {
    if (field === "city") {
      const country = (filters ?? EMPTY_METADATA).country.trim();
      if (!country) {
        return;
      }
    }
    setActiveField(field);
  }, [filters]);

  const closeModal = useCallback(() => {
    setActiveField(null);
  }, []);

  const applyField = useCallback(
    (value: string | number | null) => {
      if (!activeField) return;
      setFilters((prev) => {
        const base = prev ?? { ...EMPTY_METADATA };
        const next = applyFieldValue(base, activeField, value);
        return hasActiveSegmentFilters(next) ? next : null;
      });
      setActiveField(null);
    },
    [activeField]
  );

  const resetToGlobal = useCallback(() => {
    setFilters(null);
    setActiveField(null);
  }, []);

  const resetToProfile = useCallback(() => {
    setFilters({ ...profileMetadata });
    setActiveField(null);
  }, [profileMetadata]);

  const activeConfig = getFieldConfig(activeField);

  const filtersForModal = filters ?? { ...EMPTY_METADATA };

  return {
    filters,
    filtersForModal,
    activeField,
    activeConfig,
    openField,
    closeModal,
    applyField,
    resetToGlobal,
    resetToProfile,
  };
}
