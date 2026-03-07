import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: "2 solid #333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    borderBottom: "1 solid #ddd",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    width: "70%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
    borderTop: "1 solid #ddd",
    paddingTop: 10,
  },
})

export const MedicalRecordPDF = ({ record, patient }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Expediente Médico</Text>
          <Text style={styles.subtitle}>VetCare Drago</Text>
        </View>
        <View>
          <Text>
            Fecha: {new Date(record.visitDate).toLocaleDateString("es-ES")}
          </Text>
        </View>
      </View>

      {/* Datos del Paciente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Paciente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Especie:</Text>
          <Text style={styles.value}>{patient.species}</Text>
        </View>
        {patient.breed && (
          <View style={styles.row}>
            <Text style={styles.label}>Raza:</Text>
            <Text style={styles.value}>{patient.breed}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Propietario:</Text>
          <Text style={styles.value}>
            {patient.owner.firstName} {patient.owner.lastName}
          </Text>
        </View>
        {patient.chipNumber && (
          <View style={styles.row}>
            <Text style={styles.label}>Microchip:</Text>
            <Text style={styles.value}>{patient.chipNumber}</Text>
          </View>
        )}
      </View>

      {/* Motivo de Consulta */}
      {record.chiefComplaint && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivo de Consulta</Text>
          <Text>{record.chiefComplaint}</Text>
        </View>
      )}

      {/* Signos Vitales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signos Vitales</Text>
        {record.weight && (
          <View style={styles.row}>
            <Text style={styles.label}>Peso:</Text>
            <Text style={styles.value}>{record.weight} kg</Text>
          </View>
        )}
        {record.temperature && (
          <View style={styles.row}>
            <Text style={styles.label}>Temperatura:</Text>
            <Text style={styles.value}>{record.temperature} °C</Text>
          </View>
        )}
        {record.heartRate && (
          <View style={styles.row}>
            <Text style={styles.label}>Frecuencia Cardíaca:</Text>
            <Text style={styles.value}>{record.heartRate} lpm</Text>
          </View>
        )}
        {record.respiratoryRate && (
          <View style={styles.row}>
            <Text style={styles.label}>Frecuencia Respiratoria:</Text>
            <Text style={styles.value}>{record.respiratoryRate} rpm</Text>
          </View>
        )}
      </View>

      {/* Examen Físico */}
      {record.physicalExam && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Examen Físico</Text>
          <Text>{record.physicalExam}</Text>
        </View>
      )}

      {/* Diagnóstico */}
      {record.diagnosis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text>{record.diagnosis}</Text>
        </View>
      )}

      {/* Tratamiento */}
      {record.treatment && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tratamiento</Text>
          <Text>{record.treatment}</Text>
        </View>
      )}

      {/* Notas Adicionales */}
      {record.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Adicionales</Text>
          <Text>{record.notes}</Text>
        </View>
      )}

      {/* Firma */}
      <View style={styles.section}>
        <Text>Dr. {record.vet.name}</Text>
        <Text style={{ fontSize: 10, color: "#666" }}>
          Médico Veterinario
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generado el {new Date().toLocaleDateString("es-ES")} | VetCare Drago -
        Sistema de Gestión Veterinaria
      </Text>
    </Page>
  </Document>
)
