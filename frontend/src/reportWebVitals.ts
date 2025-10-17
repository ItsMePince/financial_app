// src/reportWebVitals.ts
type ReportHandler = (metric: unknown) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
    if (typeof onPerfEntry !== "function") return;

    import("web-vitals").then((m: any) => {
        // v3/v4 preferred APIs
        m.onCLS?.(onPerfEntry);
        m.onINP?.(onPerfEntry);
        m.onFID?.(onPerfEntry);
        m.onFCP?.(onPerfEntry);
        m.onLCP?.(onPerfEntry);
        m.onTTFB?.(onPerfEntry);


        m.getCLS?.(onPerfEntry);
        m.getFID?.(onPerfEntry);
        m.getFCP?.(onPerfEntry);
        m.getLCP?.(onPerfEntry);
        m.getTTFB?.(onPerfEntry);
    });
};

export default reportWebVitals;
