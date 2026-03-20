import { Order } from './types';

declare const window: any;

export const printTicketDirectly = async (order: Order, waiterName: string) => {
    if (!window.bluetoothSerial) {
        alert("El Bluetooth nativo solo funciona en el APK, no en el navegador.");
        return;
    }

    try {
        let ticket = "\n";
        ticket += "      TAQUERIA EL INGENIERO      \n";
        ticket += "       Los Mochis, Sinaloa       \n";
        ticket += "--------------------------------\n";
        ticket += `Fecha: ${new Date().toLocaleString('es-MX')}\n`;
        ticket += `Mesero: ${waiterName}\n`;
        ticket += `Orden: ${order.type === 'DINE_IN' ? 'Mesa ' + order.tableId : 'Llevar'}\n`;
        ticket += "--------------------------------\n";

        order.items.forEach(item => {
            ticket += `${item.quantity}x ${item.name}\n`;
            ticket += `   $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        ticket += "--------------------------------\n";
        ticket += `TOTAL: $${order.total.toFixed(2)}\n\n`;
        ticket += "  ¡Gracias por su preferencia!  \n\n\n\n";

        // Lógica nativa de conexión
        window.bluetoothSerial.isEnabled(
            () => {
                window.bluetoothSerial.list((devices: any[]) => {
                    const printer = devices.find((d: any) => 
                        d.name.toLowerCase().includes('printer') || 
                        d.name.toLowerCase().includes('pos') || 
                        d.name.toLowerCase().includes('mpt') || d.class === 1664
                    );

                    if (!printer) {
                        alert("No se encontró impresora vinculada en el Bluetooth.");
                        return;
                    }

                    window.bluetoothSerial.connect(printer.address, () => {
                        window.bluetoothSerial.write(ticket, () => {
                            window.bluetoothSerial.disconnect(); // Desconecta al terminar
                        }, (err: any) => { alert("Error al imprimir: " + err); window.bluetoothSerial.disconnect(); });
                    }, (err: any) => { alert("Error de conexión: " + err); });

                }, (err: any) => alert("Error al buscar dispositivos: " + err));
            },
            () => { alert("Por favor, enciende el Bluetooth del celular."); }
        );
    } catch (error) { console.error("Error crítico:", error); }
};