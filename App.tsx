import React from "react";

export default function App() {
    const fmt = new Intl.NumberFormat("th-TH");
    const balance = 104564;

    const styles = {
        page: {
            minHeight: "100vh",
            background: "#fff",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            color: "#0f172a",
            padding: "16px",
            maxWidth: 430,
            margin: "0 auto",
        },
        header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#e2e8f0",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
        },
        title: { fontSize: 18, fontWeight: 600 },
        totalCardWrap: {
            background: "#cfeee8",
            borderRadius: 24,
            padding: 16,
            marginBottom: 20,
            boxShadow: "0 1px 0 rgba(0,0,0,.04) inset",
        },
        totalCardInner: {
            background: "#e9fbd1",
            borderRadius: 20,
            padding: "24px 16px",
            textAlign: "center" as const,
            marginBottom: 16,
        },
        totalLabel: { fontSize: 16, fontWeight: 600, color: "#0f172a" },
        totalAmount: { fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginTop: 8 },
        tabs: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "center",
            textAlign: "center" as const,
            borderTop: "1px solid rgba(0,0,0,.08)",
        },
        tabItem: {
            padding: "14px 0",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            position: "relative" as const,
        },
        tabDivider: {
            position: "absolute" as const,
            right: 0,
            top: "25%",
            height: "50%",
            width: 1,
            background: "rgba(0,0,0,.1)",
        },
        chip: {
            background: "#cfeee8",
            borderRadius: 24,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
        },
        chipLeft: { display: "flex", alignItems: "center", gap: 12 },
        dot: {
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#d9e5e3",
        },
        chipText: { fontSize: 18, fontWeight: 600 },
        chipAmount: { fontSize: 18, fontWeight: 700, color: "#ef4444" },
        catsRow: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 28,
        },
        catCard: {
            background: "#cfeee8",
            borderRadius: 20,
            padding: 14,
            minHeight: 120,
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "flex-end",
            boxShadow: "0 1px 0 rgba(0,0,0,.04) inset",
        },
        catBadge: {
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#d9e5e3",
            marginBottom: 10,
        },
        catTitle: { fontSize: 18, fontWeight: 700, lineHeight: 1.1 },
        catSub: { fontSize: 16, color: "#0f172a", opacity: 0.9 },
        nav: {
            position: "fixed" as const,
            left: 0,
            right: 0,
            bottom: 16,
            display: "flex",
            justifyContent: "center",
            gap: 16,
        },
        navBtn: {
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#d4f1ea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
        },
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.avatar}>🙂</div>
                <div style={styles.title}>หมูกรอบ เมืองตรัง</div>
            </div>

            {/* Total */}
            <div style={styles.totalCardWrap}>
                <div style={styles.totalCardInner}>
                    <div style={styles.totalLabel}>เงินรวม</div>
                    <div style={styles.totalAmount}>{fmt.format(balance)} บาท</div>
                </div>

                <div style={styles.tabs}>
                    <div style={styles.tabItem}>
                        ทั้งหมด
                        <span style={styles.tabDivider} />
                    </div>
                    <div style={styles.tabItem}>
                        <span style={{ fontSize: 18, marginRight: 6 }}>⭡</span> รายได้
                        <span style={styles.tabDivider} />
                    </div>
                    <div style={styles.tabItem}>
                        <span style={{ fontSize: 18, marginRight: 6 }}>⭣</span> ค่าใช้จ่าย
                    </div>
                </div>
            </div>

            {/* Recent chip */}
            <div style={styles.chip}>
                <div style={styles.chipLeft}>
                    <div style={styles.dot} />
                    <div style={styles.chipText}>ซื้อหมูกรอบ</div>
                </div>
                <div style={styles.chipAmount}>-200</div>
            </div>

            {/* Categories */}
            <div style={styles.catsRow}>
                <div style={styles.catCard}>
                    <div style={styles.catBadge} />
                    <div style={styles.catTitle}>กาบาคา</div>
                    <div style={styles.catSub}>{fmt.format(20000)} บาท</div>
                </div>

                <div style={styles.catCard}>
                    <div style={styles.catBadge} />
                    <div style={styles.catTitle}>กาบาคา</div>
                    <div style={styles.catSub}>{fmt.format(20000)} บาท</div>
                </div>

                <div style={styles.catCard}>
                    <div style={styles.catBadge} />
                    <div style={styles.catTitle}>กาบาคา</div>
                    <div style={styles.catSub}>{fmt.format(20000)} บาท</div>
                </div>
            </div>

            {/* Bottom nav */}
            <div style={styles.nav}>
                <button style={styles.navBtn} aria-label="ปฏิทิน">📅</button>
                <button style={styles.navBtn} aria-label="หน้าแรก">🏠</button>
                <button style={styles.navBtn} aria-label="สถิติ">📈</button>
            </div>
        </div>
    );
}
