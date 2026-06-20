'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import styles from './DonutChart.module.css'

export default function DonutChart({ data, total }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>NPR {total.toLocaleString('en-US')}</span>
          <span className={styles.centerSub}>Total spend</span>
        </div>
      </div>

      <div className={styles.legend}>
        {data.map((entry, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: entry.color }} />
            <span className={styles.legendLabel}>{entry.name}</span>
            <span className={styles.legendPct}>{entry.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}