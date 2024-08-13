const speedEl = document.getElementById('speed');
const distanceEl = document.getElementById('distance');
const maxSpeedEl = document.getElementById('maxSpeed');
const connectBtn = document.getElementById('connectBtn');
const antitheftBtn = document.getElementById('antitheftBtn');

let bluetoothDevice;
let bluetoothCharacteristic;

connectBtn.addEventListener('click', async () => {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: '5177_Speedometer' }], // Имя вашего устройства
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // UUID сервиса Bluetooth Serial
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    bluetoothCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb'); // Характеристика для RX/TX

    // Начните слушать уведомления о значениях характеристик
    await bluetoothCharacteristic.startNotifications();
    bluetoothCharacteristic.addEventListener('characteristicvaluechanged', handleData);

    connectBtn.textContent = 'Подключено';

  } catch (error) {
    console.error('Ошибка подключения:', error);
  }
});

antitheftBtn.addEventListener('click', async () => {
  if (!bluetoothCharacteristic) return;
  try {
    const command = antitheftBtn.textContent === 'Антиугон' ? 'enableAntitheft\n' : 'disableAntitheft\n';
    await bluetoothCharacteristic.writeValue(new TextEncoder().encode(command));
    antitheftBtn.textContent = command === 'enableAntitheft\n' ? 'Отключить антиугон' : 'Антиугон';
  } catch (error) {
    console.error('Ошибка отправки команды:', error);
  }
});

function handleData(event) {
  const data = new TextDecoder().decode(event.target.value);
  console.log("Получены данные:", data); // Для отладки

  // Парсинг данных (предполагаем, что данные приходят в формате "command:value")
  const parts = data.split(':');
  const command = parts[0];
  const value = parts[1];

  switch (command) {
    case 'speed':
      speedEl.textContent = value;
      break;
    case 'distance':
      distanceEl.textContent = value;
      break;
    case 'maxSpeed':
      maxSpeedEl.textContent = value;
      break;
  }
}