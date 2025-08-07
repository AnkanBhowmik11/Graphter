 let chart;
        let serialPort;
        let reader;
        let isConnected = false;
        let lastConvertedData = null;
        let chartData = {
            labels: [],
            datasets: [{
                label: 'Data',
                data: [],
                borderColor: '#075892ff',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        };

        // Initialize chart
        function initChart() {
            const ctx = document.getElementById('mainChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'X-Axis'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Y-Axis'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'GraphTer Chart'
                        },
                        legend: {
                            display: true
                        }
                    }
                }
            });
        }

        // AI Data Conversion Functions
        async function convertWithAI() {
            // Hardcoded API key - replace with your actual Groq API key
            const apiKey = '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';
            const inputData = document.getElementById('aiInput').value.trim();
            
            if (!inputData) {
                updateAIStatus('error', 'Please enter some data to convert');
                return;
            }
            
            updateAIStatus('processing', 'Converting data with AI...');
            document.getElementById('convertBtn').disabled = true;
            
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{
                            role: 'user',
                            content: `Convert the following data to JSON format suitable for charting. The output should be an array of objects with 'x' and 'y' properties. If the data doesn't have explicit x values, use sequential numbers (1, 2, 3, etc.). Only return the JSON array, no explanations:

${inputData}`
                        }],
                        temperature: 0.1
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                const jsonResult = data.choices[0].message.content.trim();
                
                // Try to parse the result to validate it's proper JSON
                try {
                    const parsedData = JSON.parse(jsonResult);
                    lastConvertedData = jsonResult;
                    document.getElementById('aiOutput').textContent = JSON.stringify(parsedData, null, 2);
                    updateAIStatus('success', 'Data converted successfully!');
                    document.getElementById('copyBtn').disabled = false;
                    document.getElementById('useBtn').disabled = false;
                } catch (parseError) {
                    // If AI response isn't valid JSON, try to extract it
                    const cleanedResult = cleanAIResponse(jsonResult);
                    lastConvertedData = cleanedResult;
                    document.getElementById('aiOutput').textContent = cleanedResult;
                    updateAIStatus('success', 'Data converted (cleaned)');
                    document.getElementById('copyBtn').disabled = false;
                    document.getElementById('useBtn').disabled = false;
                }
                
            } catch (error) {
                updateAIStatus('error', `Error: ${error.message}`);
                document.getElementById('aiOutput').textContent = 'Error occurred during conversion';
            } finally {
                document.getElementById('convertBtn').disabled = false;
            }
        }

        function cleanAIResponse(response) {
            // Try to extract JSON array from AI response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return jsonMatch[0];
            }
            return response;
        }

        function updateAIStatus(type, message) {
            const statusEl = document.getElementById('aiStatus');
            statusEl.className = `ai-status status-${type}`;
            statusEl.textContent = message;
        }

        function clearAIInput() {
            document.getElementById('aiInput').value = '';
            document.getElementById('aiOutput').textContent = 'Converted JSON will appear here...';
            document.getElementById('copyBtn').disabled = true;
            document.getElementById('useBtn').disabled = true;
            updateAIStatus('idle', 'Ready to convert data');
            lastConvertedData = null;
        }

        function copyJsonData() {
            if (lastConvertedData) {
                navigator.clipboard.writeText(lastConvertedData).then(() => {
                    updateAIStatus('success', 'JSON copied to clipboard!');
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = lastConvertedData;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    updateAIStatus('success', 'JSON copied to clipboard!');
                });
            }
        }

        function useConvertedData() {
            if (lastConvertedData) {
                document.getElementById('manualData').value = lastConvertedData;
                document.getElementById('dataSource').value = 'manual';
                handleDataSourceChange();
                loadManualData();
                updateAIStatus('success', 'Data loaded into chart!');
            }
        }

        async function pasteFromClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('manualData').value = text;
            } catch (error) {
                // Fallback or show message
                alert('Please paste the data manually. Clipboard access may be restricted.');
            }
        }

        // Data source change handler
        function handleDataSourceChange() {
            const value = document.getElementById('dataSource').value;
            document.getElementById('manualInput').style.display = value === 'manual' ? 'block' : 'none';
            document.getElementById('fileInput').style.display = value === 'file' ? 'block' : 'none';
            document.getElementById('arduinoInput').style.display = value === 'arduino' ? 'block' : 'none';
        }

        document.getElementById('dataSource').addEventListener('change', handleDataSourceChange);

        // Manual data input
        function loadManualData() {
            try {
                const data = JSON.parse(document.getElementById('manualData').value);
                chartData.labels = data.map((item, index) => item.x || index);
                chartData.datasets[0].data = data.map(item => item.y || item);
                chart.update();
            } catch (error) {
                alert('Invalid JSON format. Please check your data.');
            }
        }

        // File upload handler
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (file.name.endsWith('.json')) {
                        const data = JSON.parse(e.target.result);
                        chartData.labels = data.map((item, index) => item.x || index);
                        chartData.datasets[0].data = data.map(item => item.y || item);
                    } else if (file.name.endsWith('.csv')) {
                        const lines = e.target.result.split('\n');
                        const data = [];
                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',');
                            if (values.length >= 2) {
                                data.push({x: parseFloat(values[0]), y: parseFloat(values[1])});
                            }
                        }
                        chartData.labels = data.map(item => item.x);
                        chartData.datasets[0].data = data.map(item => item.y);
                    }
                    chart.update();
                } catch (error) {
                    alert('Error parsing file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }

        // Serial connection (Web Serial API)
        async function connectSerial() {
            try {
                if ('serial' in navigator) {
                    serialPort = await navigator.serial.requestPort();
                    await serialPort.open({ baudRate: parseInt(document.getElementById('baudRate').value) });
                    
                    const textDecoder = new TextDecoderStream();
                    const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
                    reader = textDecoder.readable.getReader();
                    
                    isConnected = true;
                    document.getElementById('serialStatus').textContent = 'Serial Monitor: Connected';
                    document.getElementById('serialStatus').className = 'serial-status status-connected';
                    
                    readSerialData();
                } else {
                    alert('Web Serial API not supported. Please use Chrome/Edge browser.');
                }
            } catch (error) {
                alert('Error connecting to serial port: ' + error.message);
            }
        }

        async function disconnectSerial() {
            if (isConnected && serialPort) {
                await reader.cancel();
                await serialPort.close();
                isConnected = false;
                document.getElementById('serialStatus').textContent = 'Serial Monitor: Disconnected';
                document.getElementById('serialStatus').className = 'serial-status status-disconnected';
            }
        }

        async function readSerialData() {
            let buffer = '';
            while (isConnected) {
                try {
                    const { value, done } = await reader.read();
                    if (done) break;
                    
                    buffer += value;
                    const lines = buffer.split('\n');
                    buffer = lines.pop();
                    
                    for (const line of lines) {
                        if (line.trim()) {
                            processSerialData(line.trim());
                        }
                    }
                } catch (error) {
                    console.error('Error reading serial data:', error);
                    break;
                }
            }
        }

        function processSerialData(data) {
            const format = document.getElementById('dataFormat').value;
            const dataPointsDiv = document.getElementById('dataPoints');
            
            // Add to preview
            const dataPoint = document.createElement('div');
            dataPoint.className = 'data-point';
            dataPoint.textContent = new Date().toLocaleTimeString() + ': ' + data;
            dataPointsDiv.appendChild(dataPoint);
            
            // Keep only last 10 entries
            while (dataPointsDiv.children.length > 10) {
                dataPointsDiv.removeChild(dataPointsDiv.firstChild);
            }
            
            try {
                let value;
                if (format === 'single') {
                    value = parseFloat(data);
                } else if (format === 'csv') {
                    const parts = data.split(',');
                    value = parseFloat(parts[parts.length - 1]);
                } else if (format === 'json') {
                    const parsed = JSON.parse(data);
                    value = parsed.value || parsed.y || Object.values(parsed)[0];
                }
                
                if (!isNaN(value)) {
                    const timestamp = new Date().toLocaleTimeString();
                    chartData.labels.push(timestamp);
                    chartData.datasets[0].data.push(value);
                    
                    // Keep only last 50 data points
                    if (chartData.labels.length > 50) {
                        chartData.labels.shift();
                        chartData.datasets[0].data.shift();
                    }
                    
                    chart.update('none');
                }
            } catch (error) {
                console.error('Error processing serial data:', error);
            }
        }

        function clearData() {
            chartData.labels = [];
            chartData.datasets[0].data = [];
            chart.update();
            document.getElementById('dataPoints').innerHTML = '';
        }

        // Chart configuration
        function updateChart() {
            const type = document.getElementById('chartType').value;
            const title = document.getElementById('chartTitle').value;
            const xLabel = document.getElementById('xAxisLabel').value;
            const yLabel = document.getElementById('yAxisLabel').value;
            const lineColor = document.getElementById('lineColor').value;
            const bgColor = document.getElementById('bgColor').value;
            
            chart.destroy();
            
            const ctx = document.getElementById('mainChart').getContext('2d');
            chart = new Chart(ctx, {
                type: type,
                data: {
                    ...chartData,
                    datasets: [{
                        ...chartData.datasets[0],
                        borderColor: lineColor,
                        backgroundColor: lineColor + '33',
                        fill: type === 'area'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    backgroundColor: bgColor,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: xLabel || 'X-Axis'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: yLabel || 'Y-Axis'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: title || 'GraphTer Chart'
                        },
                        legend: {
                            display: true
                        }
                    }
                }
            });
        }

        // Export functions
        function showExportModal() {
            document.getElementById('exportModal').style.display = 'block';
        }

        function closeExportModal() {
            document.getElementById('exportModal').style.display = 'none';
        }

        function downloadImage() {
            const canvas = document.getElementById('mainChart');
            const link = document.createElement('a');
            link.download = 'graphter-chart.png';
            link.href = canvas.toDataURL();
            link.click();
        }

        function downloadPDF() {
            const canvas = document.getElementById('mainChart');
            html2canvas(canvas).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 10, 10, 180, 120);
                pdf.save('graphter-chart.pdf');
            });
        }

        function exportWithConfig() {
            const format = document.getElementById('exportFormat').value;
            const resolution = parseInt(document.getElementById('exportResolution').value);
            const width = parseInt(document.getElementById('exportWidth').value);
            const height = parseInt(document.getElementById('exportHeight').value);
            const bgColor = document.getElementById('exportBgColor').value;
            
            const canvas = document.getElementById('mainChart');
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            
            tempCanvas.width = width * resolution;
            tempCanvas.height = height * resolution;
            ctx.scale(resolution, resolution);
            
            // Fill background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            
            // Draw chart
            ctx.drawImage(canvas, 0, 0, width, height);
            
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = 'graphter-chart.png';
                link.href = tempCanvas.toDataURL();
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                const imgData = tempCanvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 10, 10, 180, 120);
                pdf.save('graphter-chart.pdf');
            }
            
            closeExportModal();
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            initChart();
        });