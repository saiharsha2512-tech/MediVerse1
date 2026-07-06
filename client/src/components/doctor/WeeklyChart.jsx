import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../../pages/doctor/DoctorDashboard.module.css';

const data = [
  { name: 'Mon', consultations: 8 },
  { name: 'Tue', consultations: 12 },
  { name: 'Wed', consultations: 10 },
  { name: 'Thu', consultations: 15 },
  { name: 'Fri', consultations: 14 },
  { name: 'Sat', consultations: 6 },
];

const WeeklyChart = ({ apiData }) => {
  const chartData = apiData || data;

  return (
    <div className={styles.cardSection}>
      <h3 className={styles.sectionTitle}>Weekly Consultations</h3>
      <div style={{ width: '100%', height: 280, marginTop: '20px' }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={{stroke: '#e2e8f0'}} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={{stroke: '#e2e8f0'}} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} ticks={[0, 4, 8, 12, 16]} domain={[0, 16]} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="consultations" fill="url(#colorConsultations)" radius={[4, 4, 0, 0]} barSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;
