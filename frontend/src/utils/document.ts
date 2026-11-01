const megabytes = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

/** 1800 -> « 1,8 Mo » ; 640 -> « 640 Ko » */
export function formatFileSize(sizeKb: number): string {
  return sizeKb < 1024 ? `${sizeKb} Ko` : `${megabytes.format(sizeKb / 1024)} Mo`
}