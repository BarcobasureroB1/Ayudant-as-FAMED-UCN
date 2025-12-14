import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

interface Participante {
    nombre: string;
    cargo: string;
    correo: string;
}

interface Firma {
    nombre: string;
    cargo: string;
}

interface ActaPDFProps {
    data: {
        departamento: string;
        fecha: string;
        hora_inicio: string;
        hora_fin: string;
        lugar: string;
        participantes: Participante[];
        firmas: Firma[];
    };
}

const styles = StyleSheet.create({
    page: {

        paddingTop: 90,
        paddingBottom: 40,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        position: 'relative',
    },
    pageNumberBox: {
        position: 'absolute',
        top: 60, 
        right: 40,
        flexDirection: 'row',
    },
    pageNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10,
    },
    logo: {
        width: 65,
        height: 65,
        marginBottom: 6,
        objectFit: 'contain'
    },
    universityName: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    orangeBar: {
        backgroundColor: '#D35400',
        paddingVertical: 2,
        paddingHorizontal: 20,
        marginTop: 4,
        marginBottom: 4,
        alignSelf: 'center',
        width: 'auto',
    },
    orangeBarText: {
        color: '#FFF',
        fontSize: 8,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    facultyName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    
    titleBox: {
        border: '1px solid #000',
        flexDirection: 'row',
        marginTop: 10,
        height: 75,
    },
    titleBoxLeft: {
        width: '60%',
        borderRight: '1px solid #000',
        flexDirection: 'column',
    },
    titleBoxRight: {
        width: '40%',
        flexDirection: 'column',
    },
    titleCellUpper: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid #000',
        padding: 4,
    },
    titleCellLower: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    titleTextMain: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleTextSub: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    infoTable: {
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
    },
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        minHeight: 24,
        alignItems: 'center',
    },
    rowNoBorder: {
        flexDirection: 'row',
        minHeight: 24,
        alignItems: 'center',
    },
    cellLabel: {
        width: '25%',
        paddingLeft: 6,
        paddingVertical: 5,
        fontWeight: 'bold',
        fontSize: 11,
        borderRight: '1px solid #000',
        height: '100%',
        textAlign: 'left', 
    },
    cellValue: {
        width: '25%',
        paddingLeft: 6,
        paddingVertical: 5,
        fontSize: 11,
        borderRight: '1px solid #000',
        height: '100%',
    },
    cellLabelShort: {
        width: '20%',
        paddingLeft: 6,
        paddingVertical: 5,
        fontWeight: 'bold',
        fontSize: 11,
        borderRight: '1px solid #000',
        height: '100%',
    },
    cellValueLast: {
        width: '30%',
        paddingLeft: 6,
        paddingVertical: 5,
        fontSize: 11,
        height: '100%',
    },

    tableHeaderRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        backgroundColor: '#f0f0f0', 
        minHeight: 24,
    },
    col1: { width: '40%', padding: 5, borderRight: '1px solid #000', fontSize: 11, fontWeight: 'bold' },
    col2: { width: '30%', padding: 5, borderRight: '1px solid #000', fontSize: 11 },
    col3: { width: '30%', padding: 5, fontSize: 11 },
    
    col1Data: { width: '40%', padding: 5, borderRight: '1px solid #000', fontSize: 11 },
    col2Data: { width: '30%', padding: 5, borderRight: '1px solid #000', fontSize: 11 },
    col3Data: { width: '30%', padding: 5, fontSize: 11 },

    signatureSection: {
        marginTop: 50,
        width: '100%',
        justifyContent: 'center', 
    },
    signatureTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 25,
        color: '#000',
        alignSelf: 'center',
        textAlign: 'center',
    },
    signatureRow: {
        flexDirection: 'row',
        marginBottom: 30, 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
    },
    signatureInfo: {
        marginRight: 15, 
        textAlign: 'right', 
        width: 'auto', 
    },
    signatureName: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    signatureRole: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#444',
    },
    signatureLineBox: {
        width: 220, 
        borderBottom: '1px solid #000',
        height: 1, 
    }
});

export const ActaPDF = ({ data }: ActaPDFProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            
             <View style={styles.pageNumberBox}>
                <Text style={styles.pageNumberText}>N° ________</Text>
            </View>

            <View style={styles.headerContainer}>
                <Image src="/logo-ucn.png" style={styles.logo} />
                <Text style={styles.universityName}>Universidad Católica del Norte</Text>
                
                <View style={styles.orangeBar}>
                    <Text style={styles.orangeBarText}>ver más allá</Text>
                </View>
                
                <Text style={styles.facultyName}>Facultad de Medicina</Text>
            </View>

            <View style={styles.titleBox}>
                <View style={styles.titleBoxLeft}>
                    <View style={styles.titleCellUpper}>
                         <Text style={styles.titleTextMain}>
                             Alumnos Ayudantes Depto. {data.departamento || "________"}
                         </Text>
                    </View>
                    <View style={styles.titleCellLower}>
                        <Text style={styles.titleTextSub}>ACTA DE REUNIÓN</Text>
                    </View>
                </View>

                <View style={styles.titleBoxRight}>
                    <View style={styles.titleCellUpper}>
                        <Text style={styles.titleTextMain}>REGISTRO</Text>
                    </View>
                    <View style={styles.titleCellLower}>
                        <Text style={styles.titleTextSub}>FAC./MED.</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoTable}>
                <View style={styles.row}>
                    <Text style={styles.cellLabel}>Fecha de la reunión</Text>
                    <Text style={styles.cellValue}>{data.fecha}</Text>
                    <Text style={styles.cellLabelShort}>Lugar</Text>
                    <Text style={styles.cellValueLast}>{data.lugar}</Text>
                </View>
                <View style={styles.rowNoBorder}>
                    <Text style={styles.cellLabel}>Hora de Inicio</Text>
                    <Text style={styles.cellValue}>{data.hora_inicio} hrs.</Text>
                    <Text style={styles.cellLabelShort}>Hora de Término</Text>
                    <Text style={styles.cellValueLast}>{data.hora_fin} hrs.</Text>
                </View>
            </View>

            <View style={{...styles.infoTable, borderTop: '1px solid #000', marginTop: 10}}>
                 <View style={styles.tableHeaderRow}>
                    <Text style={styles.col1}>Asistentes</Text>
                    <Text style={{...styles.col2, fontWeight: 'bold'}}>Cargo / Rol</Text>
                    <Text style={{...styles.col3, fontWeight: 'bold'}}>Correo</Text>
                </View>
                
                {data.participantes.map((p, index) => (
                    <View key={index} style={{
                        ...styles.rowNoBorder, 
                        borderBottom: index === data.participantes.length - 1 ? 'none' : '1px solid #ccc' 
                    }}>
                        <Text style={styles.col1Data}>{p.nombre}</Text>
                        <Text style={styles.col2Data}>{p.cargo}</Text>
                        <Text style={styles.col3Data}>{p.correo}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.signatureSection}>
                <Text style={styles.signatureTitle}>REGISTRO DE FIRMAS</Text>
                
                {data.firmas.map((firma, index) => (
                    <View key={index} style={styles.signatureRow}>
                        <View style={styles.signatureInfo}>
                            <Text style={styles.signatureName}>{firma.nombre}</Text>
                            <Text style={styles.signatureRole}>{firma.cargo}</Text>
                        </View>
                        
                        <View style={styles.signatureLineBox} />
                    </View>
                ))}
            </View>

        </Page>
    </Document>
);