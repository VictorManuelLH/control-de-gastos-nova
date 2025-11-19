import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCategoryById, TRANSACTION_TYPES } from '../constants';

/**
 * Servicio para generar reportes PDF
 */
class PDFService {
    constructor() {
        this.primaryColor = [102, 126, 234]; // #667eea
        this.secondaryColor = [118, 75, 162]; // #764ba2
        this.successColor = [46, 204, 113];
        this.errorColor = [231, 76, 60];
    }

    /**
     * Formatea moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    /**
     * Formatea fecha
     */
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    /**
     * Agrega encabezado al PDF
     */
    addHeader(doc, title) {
        // Fondo del encabezado
        doc.setFillColor(...this.primaryColor);
        doc.rect(0, 0, 210, 40, 'F');

        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text(title, 105, 20, { align: 'center' });

        // Fecha de generación
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generado: ${this.formatDate(Date.now())}`, 105, 30, { align: 'center' });

        // Resetear color de texto
        doc.setTextColor(0, 0, 0);
    }

    /**
     * Agrega pie de página
     */
    addFooter(doc, pageNumber) {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Página ${pageNumber} - Control de Gastos`,
            105,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    /**
     * Genera reporte de transacciones
     */
    generateTransactionsReport(transactions, filters = {}) {
        const doc = new jsPDF();

        // Encabezado
        this.addHeader(doc, 'Reporte de Transacciones');

        let yPosition = 50;

        // Filtros aplicados
        if (filters.startDate || filters.endDate) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            let filterText = 'Período: ';
            if (filters.startDate) filterText += `Desde ${this.formatDate(filters.startDate)} `;
            if (filters.endDate) filterText += `Hasta ${this.formatDate(filters.endDate)}`;
            doc.text(filterText, 14, yPosition);
            yPosition += 10;
        }

        // Estadísticas generales
        const totalExpenses = transactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Cuadros de resumen
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Resumen', 14, yPosition);
        yPosition += 8;

        const summaryData = [
            ['Total Ingresos', this.formatCurrency(totalIncome)],
            ['Total Gastos', this.formatCurrency(totalExpenses)],
            ['Balance', this.formatCurrency(balance)]
        ];

        autoTable(doc, {
            startY: yPosition,
            head: [['Concepto', 'Monto']],
            body: summaryData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                1: { halign: 'right', fontStyle: 'bold' }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // Tabla de transacciones
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Detalle de Transacciones', 14, yPosition);
        yPosition += 5;

        const tableData = transactions
            .sort((a, b) => b.date - a.date)
            .map(transaction => {
                const category = getCategoryById(transaction.category, transaction.type);
                const isExpense = transaction.type === TRANSACTION_TYPES.EXPENSE;
                return [
                    this.formatDate(transaction.date),
                    category.name,
                    transaction.description || '-',
                    isExpense ? 'Gasto' : 'Ingreso',
                    this.formatCurrency(transaction.amount)
                ];
            });

        autoTable(doc, {
            startY: yPosition,
            head: [['Fecha', 'Categoría', 'Descripción', 'Tipo', 'Monto']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 30 },
                2: { cellWidth: 60 },
                3: { cellWidth: 25 },
                4: { halign: 'right', cellWidth: 30 }
            },
            didDrawPage: (data) => {
                this.addFooter(doc, doc.internal.getCurrentPageInfo().pageNumber);
            }
        });

        // Guardar PDF
        const fileName = `transacciones_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    }

    /**
     * Genera reporte de estadísticas con gráficas
     */
    generateStatisticsReport(transactions, chartImages = {}) {
        const doc = new jsPDF();

        // Encabezado
        this.addHeader(doc, 'Resumen de Estadísticas');

        let yPosition = 50;

        // Agregar gráfica de gastos por categoría si está disponible
        if (chartImages['expenses-by-category-chart']) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Distribución de Gastos por Categoría', 14, yPosition);
            yPosition += 10;

            try {
                const imgWidth = 180;
                const imgHeight = 90;
                doc.addImage(
                    chartImages['expenses-by-category-chart'],
                    'PNG',
                    15,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 15;
            } catch (error) {
                console.error('Error al agregar gráfica:', error);
                yPosition += 10;
            }
        }

        // Verificar si necesitamos nueva página
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }

        // Estadísticas generales
        const totalExpenses = transactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Resumen principal
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Resumen Financiero', 14, yPosition);
        yPosition += 10;

        const mainSummary = [
            ['Total Ingresos', this.formatCurrency(totalIncome)],
            ['Total Gastos', this.formatCurrency(totalExpenses)],
            ['Balance Neto', this.formatCurrency(balance)],
            ['Total Transacciones', transactions.length.toString()]
        ];

        autoTable(doc, {
            startY: yPosition,
            body: mainSummary,
            theme: 'plain',
            styles: { fontSize: 11, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { halign: 'right', fontStyle: 'bold', cellWidth: 'auto' }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // Gastos por categoría
        const expensesByCategory = transactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((acc, transaction) => {
                const category = getCategoryById(transaction.category, transaction.type);
                if (!acc[category.name]) {
                    acc[category.name] = 0;
                }
                acc[category.name] += transaction.amount;
                return acc;
            }, {});

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Gastos por Categoría', 14, yPosition);
        yPosition += 5;

        const categoryData = Object.entries(expensesByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                return [category, this.formatCurrency(amount), `${percentage}%`];
            });

        if (categoryData.length > 0) {
            autoTable(doc, {
                startY: yPosition,
                head: [['Categoría', 'Monto', '% del Total']],
                body: categoryData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.primaryColor,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        }

        // Agregar gráfica de ingresos vs gastos si está disponible
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        if (chartImages['income-vs-expenses-chart']) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Comparación de Ingresos y Gastos', 14, yPosition);
            yPosition += 10;

            try {
                const imgWidth = 180;
                const imgHeight = 80;
                doc.addImage(
                    chartImages['income-vs-expenses-chart'],
                    'PNG',
                    15,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 15;
            } catch (error) {
                console.error('Error al agregar gráfica de comparación:', error);
                yPosition += 10;
            }
        }

        // Ingresos por categoría
        const incomeByCategory = transactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((acc, transaction) => {
                const category = getCategoryById(transaction.category, transaction.type);
                if (!acc[category.name]) {
                    acc[category.name] = 0;
                }
                acc[category.name] += transaction.amount;
                return acc;
            }, {});

        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Ingresos por Categoría', 14, yPosition);
        yPosition += 5;

        const incomeData = Object.entries(incomeByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percentage = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
                return [category, this.formatCurrency(amount), `${percentage}%`];
            });

        if (incomeData.length > 0) {
            autoTable(doc, {
                startY: yPosition,
                head: [['Categoría', 'Monto', '% del Total']],
                body: incomeData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.successColor,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' }
                },
                didDrawPage: (data) => {
                    this.addFooter(doc, doc.internal.getCurrentPageInfo().pageNumber);
                }
            });
        }

        // Guardar PDF
        const fileName = `estadisticas_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    }

    /**
     * Genera reporte de presupuestos
     */
    generateBudgetsReport(budgets, transactions) {
        const doc = new jsPDF();

        // Encabezado
        this.addHeader(doc, 'Reporte de Presupuestos');

        let yPosition = 50;

        // Estadísticas de presupuestos
        const activeCount = budgets.filter(b => b.enabled).length;
        let exceededCount = 0;
        let atRiskCount = 0;

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Resumen de Presupuestos', 14, yPosition);
        yPosition += 10;

        const summaryData = [
            ['Total Presupuestos', budgets.length.toString()],
            ['Presupuestos Activos', activeCount.toString()]
        ];

        autoTable(doc, {
            startY: yPosition,
            body: summaryData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { halign: 'right', cellWidth: 'auto' }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // Detalle de presupuestos
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Detalle de Presupuestos', 14, yPosition);
        yPosition += 5;

        const budgetData = budgets.map(budget => {
            const category = getCategoryById(budget.categoryId, TRANSACTION_TYPES.EXPENSE);

            // Calcular gasto actual
            const spent = transactions
                .filter(t => {
                    if (t.type !== TRANSACTION_TYPES.EXPENSE) return false;
                    if (t.category !== budget.categoryId) return false;

                    const transactionDate = new Date(t.date);
                    if (transactionDate.getFullYear() !== budget.year) return false;

                    if (budget.period === 'monthly' && transactionDate.getMonth() !== budget.month) {
                        return false;
                    }

                    return true;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const percentage = budget.amount > 0 ? ((spent / budget.amount) * 100).toFixed(1) : 0;
            const remaining = budget.amount - spent;

            // Determinar estado
            let status = 'Normal';
            if (percentage >= 100) {
                status = 'Excedido';
                exceededCount++;
            } else if (percentage >= 90) {
                status = 'Crítico';
                atRiskCount++;
            } else if (percentage >= 80) {
                status = 'Alerta';
                atRiskCount++;
            }

            const periodText = budget.period === 'monthly'
                ? `${new Date(budget.year, budget.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
                : budget.year.toString();

            return [
                category.name,
                periodText,
                this.formatCurrency(budget.amount),
                this.formatCurrency(spent),
                `${percentage}%`,
                this.formatCurrency(remaining),
                status,
                budget.enabled ? 'Sí' : 'No'
            ];
        });

        autoTable(doc, {
            startY: yPosition,
            head: [['Categoría', 'Período', 'Presupuesto', 'Gastado', '%', 'Restante', 'Estado', 'Activo']],
            body: budgetData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                fontSize: 8,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 25 },
                2: { halign: 'right', cellWidth: 23 },
                3: { halign: 'right', cellWidth: 23 },
                4: { halign: 'right', cellWidth: 15 },
                5: { halign: 'right', cellWidth: 23 },
                6: { cellWidth: 20 },
                7: { halign: 'center', cellWidth: 15 }
            },
            didDrawCell: (data) => {
                // Colorear el estado
                if (data.column.index === 6 && data.section === 'body') {
                    const status = data.cell.raw;
                    if (status === 'Excedido') {
                        doc.setTextColor(231, 76, 60);
                    } else if (status === 'Crítico') {
                        doc.setTextColor(230, 126, 34);
                    } else if (status === 'Alerta') {
                        doc.setTextColor(241, 196, 15);
                    }
                }
            },
            didDrawPage: (data) => {
                this.addFooter(doc, doc.internal.getCurrentPageInfo().pageNumber);
            }
        });

        // Guardar PDF
        const fileName = `presupuestos_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    }

    /**
     * Genera reporte mensual completo
     */
    generateMonthlyReport(transactions, budgets, month, year, chartImages = {}) {
        const doc = new jsPDF();

        // Determinar el período
        const monthName = new Date(year, month).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });

        // Encabezado
        this.addHeader(doc, `Reporte Mensual - ${monthName}`);

        let yPosition = 50;

        // Agregar gráfica de tendencia mensual si está disponible
        if (chartImages['monthly-trend-chart']) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Tendencia de Ingresos y Gastos', 14, yPosition);
            yPosition += 10;

            try {
                const imgWidth = 180;
                const imgHeight = 80;
                doc.addImage(
                    chartImages['monthly-trend-chart'],
                    'PNG',
                    15,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 15;
            } catch (error) {
                console.error('Error al agregar gráfica de tendencia:', error);
                yPosition += 10;
            }
        }

        // Verificar si necesitamos nueva página
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        // Filtrar transacciones del mes
        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        // Estadísticas generales
        const totalExpenses = monthlyTransactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = monthlyTransactions
            .filter(t => t.type === TRANSACTION_TYPES.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Sección 1: Resumen Ejecutivo
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Resumen Ejecutivo', 14, yPosition);
        yPosition += 10;

        const executiveSummary = [
            ['Total Ingresos', this.formatCurrency(totalIncome)],
            ['Total Gastos', this.formatCurrency(totalExpenses)],
            ['Balance Neto', this.formatCurrency(balance)],
            ['Total Transacciones', monthlyTransactions.length.toString()],
            ['Promedio Diario de Gastos', this.formatCurrency(totalExpenses / 30)]
        ];

        autoTable(doc, {
            startY: yPosition,
            body: executiveSummary,
            theme: 'plain',
            styles: { fontSize: 11, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 90 },
                1: { halign: 'right', fontStyle: 'bold', cellWidth: 'auto' }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // Sección 2: Gastos por Categoría
        const expensesByCategory = monthlyTransactions
            .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
            .reduce((acc, transaction) => {
                const category = getCategoryById(transaction.category, transaction.type);
                if (!acc[category.name]) {
                    acc[category.name] = 0;
                }
                acc[category.name] += transaction.amount;
                return acc;
            }, {});

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Gastos por Categoría', 14, yPosition);
        yPosition += 5;

        const categoryData = Object.entries(expensesByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                return [category, this.formatCurrency(amount), `${percentage}%`];
            });

        if (categoryData.length > 0) {
            autoTable(doc, {
                startY: yPosition,
                head: [['Categoría', 'Monto', '% del Total']],
                body: categoryData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.primaryColor,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        }

        // Agregar gráfica de gastos por categoría si está disponible
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        if (chartImages['expenses-by-category-chart']) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Distribución de Gastos por Categoría', 14, yPosition);
            yPosition += 10;

            try {
                const imgWidth = 180;
                const imgHeight = 90;
                doc.addImage(
                    chartImages['expenses-by-category-chart'],
                    'PNG',
                    15,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 15;
            } catch (error) {
                console.error('Error al agregar gráfica de categorías:', error);
                yPosition += 10;
            }
        }

        // Agregar gráfica de ingresos vs gastos si está disponible
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        if (chartImages['income-vs-expenses-chart']) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Comparación de Ingresos y Gastos', 14, yPosition);
            yPosition += 10;

            try {
                const imgWidth = 180;
                const imgHeight = 80;
                doc.addImage(
                    chartImages['income-vs-expenses-chart'],
                    'PNG',
                    15,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 15;
            } catch (error) {
                console.error('Error al agregar gráfica de comparación:', error);
                yPosition += 10;
            }
        }

        // Nueva página para presupuestos
        doc.addPage();
        yPosition = 20;

        // Sección 3: Estado de Presupuestos
        const monthlyBudgets = budgets.filter(b =>
            b.enabled &&
            b.year === year &&
            (b.period === 'yearly' || b.month === month)
        );

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Estado de Presupuestos', 14, yPosition);
        yPosition += 5;

        if (monthlyBudgets.length > 0) {
            const budgetData = monthlyBudgets.map(budget => {
                const category = getCategoryById(budget.categoryId, TRANSACTION_TYPES.EXPENSE);

                const spent = monthlyTransactions
                    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE && t.category === budget.categoryId)
                    .reduce((sum, t) => sum + t.amount, 0);

                const percentage = budget.amount > 0 ? ((spent / budget.amount) * 100).toFixed(1) : 0;
                const remaining = budget.amount - spent;

                let status = 'Normal';
                if (percentage >= 100) status = 'Excedido';
                else if (percentage >= 90) status = 'Crítico';
                else if (percentage >= 80) status = 'Alerta';

                return [
                    category.name,
                    this.formatCurrency(budget.amount),
                    this.formatCurrency(spent),
                    `${percentage}%`,
                    this.formatCurrency(remaining),
                    status
                ];
            });

            autoTable(doc, {
                startY: yPosition,
                head: [['Categoría', 'Presupuesto', 'Gastado', '%', 'Restante', 'Estado']],
                body: budgetData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.primaryColor,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' },
                    3: { halign: 'right' },
                    4: { halign: 'right' }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        } else {
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text('No hay presupuestos activos para este período', 14, yPosition);
            yPosition += 15;
        }

        // Sección 4: Transacciones Recientes (Top 10)
        if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Principales Transacciones', 14, yPosition);
        yPosition += 5;

        const topTransactions = [...monthlyTransactions]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 15)
            .map(transaction => {
                const category = getCategoryById(transaction.category, transaction.type);
                const isExpense = transaction.type === TRANSACTION_TYPES.EXPENSE;
                return [
                    this.formatDate(transaction.date),
                    category.name,
                    transaction.description || '-',
                    isExpense ? 'Gasto' : 'Ingreso',
                    this.formatCurrency(transaction.amount)
                ];
            });

        autoTable(doc, {
            startY: yPosition,
            head: [['Fecha', 'Categoría', 'Descripción', 'Tipo', 'Monto']],
            body: topTransactions,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 30 },
                2: { cellWidth: 55 },
                3: { cellWidth: 25 },
                4: { halign: 'right', cellWidth: 30 }
            },
            didDrawPage: (data) => {
                this.addFooter(doc, doc.internal.getCurrentPageInfo().pageNumber);
            }
        });

        // Guardar PDF
        const fileName = `reporte_mensual_${monthName.replace(' ', '_')}_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    }
}

// Exportar instancia única del servicio
export const pdfService = new PDFService();
