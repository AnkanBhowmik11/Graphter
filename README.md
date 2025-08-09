# GraphTer 📊
A real-time, browser-based data visualization tool with an AI data converter, hardware connectivity, and multiple export options. This project allows users to effortlessly turn raw data from various sources into beautiful, interactive charts.

## About The Project
GraphTer is a powerful, client-side utility designed to bridge the gap between raw data and insightful visualizations. Built entirely with HTML, CSS, and JavaScript, it runs completely in your browser, meaning your data stays private and the tool is fast and responsive. Whether you have unstructured text, a structured data file, or live data streaming from a microcontroller, GraphTer provides an intuitive interface to plot, customize, and export high-quality graphs in real-time.

## Built With
This project is built with vanilla web technologies and relies on a few key libraries and APIs including HTML5, CSS3, JavaScript, Chart.js for chart rendering, the Groq API for AI-powered data conversion, jsPDF and html2canvas for exporting, and the Web Serial API for hardware connectivity.

## Features
🤖 The AI Data Converter lets you paste data in any format, like text or tables, and the AI will automatically convert it into a chart-ready JSON structure.

📁 It supports multiple data sources. You can use the manual input to directly paste JSON data, upload local .csv and .json files, or use the live hardware link to connect to Arduino, ESP32, or other microcontrollers to plot sensor data in real-time.

🎨 Dynamic customization allows you to switch between Line, Bar, Scatter, and Area charts. You can also customize the chart title, axis labels, line color, and background color.

📥 Advanced exporting is available to download charts as PNG or PDF. An export modal allows for configuring output resolution, dimensions, and background color for high-quality exports.

🔌 You can view live data coming from a serial device in a real-time preview before it is plotted on the main chart.

📱 The user interface is responsive and designed to be usable on both desktop and mobile devices.

## Getting Started
To get a local copy up and running, you will need a modern web browser that supports the Web Serial API, like Google Chrome or Microsoft Edge, for the Arduino feature, and a free Groq API key for the AI Data Converter feature.

1. Clone the repository.
2. Get a free API key from the Groq Console.
3. Open the script.js file and find the line `const apiKey = '-';`.
4. Replace the `-` with your actual Groq API key.
5. Navigate to the project folder and open the index.html file in your web browser.

## How to Use
🤖 To use the AI Data Converter:
1. Paste your unstructured data into the "Paste your data..." text area.
2. Click `🔄 Convert to JSON`.
3. Once the AI generates the JSON, click `✨ Use in Chart` to load the data.

📁 To upload a file:
1. Select "Upload CSV/JSON" from the `Data Source Type` dropdown.
2. Click "Choose File" and select a `.json` or `.csv` file. The chart will update automatically.

🔌 To connect to the Arduino Serial Monitor:
1. Select "Arduino Serial Monitor" from the `Data Source Type` dropdown.
2. Connect your device, like an Arduino, to your computer.
3. Set the `Baud Rate` and `Data Format` to match your device's code.
4. Click `Connect` and select the correct serial port from the browser pop-up.
5. Data sent from your device will now appear in the live preview and on the chart.

🎨 To customize your graph, use the "Chart Configuration" section to modify the chart's appearance. Change the type, titles, labels, and colors, then click `Update Chart` to apply the changes.

📥 To export your graph, click `📸 Download PNG` or `📄 Download PDF` for a quick export. For more control, click `📥 Export Options`, configure the settings in the modal, and click `Export`.

## Roadmap
Future improvements could include implementing the SVG export functionality listed in the export modal, adding more chart types like Pie, Doughnut, or Radar from Chart.js, and allowing users to save and load chart configurations to the browser's local storage. Supporting multiple datasets on a single chart is another potential enhancement.

Deployment
🚀 This project is deployed and live on Vercel.

🔗 You can access the live application here: https://graphter-seven.vercel.app/

Deployment is handled automatically by Vercel. Any changes pushed to the main branch of the connected GitHub repository will trigger a new deployment.

The Team
🧑‍💻 This project was brought to you by the members of Team Binary:

Contact
📧 For questions, feedback, or support, please open an issue on the project's GitHub repository. You can also reach the team lead directly via email at ankanbhomwik11@gmail.com or aparajitachattopadhyay188@gmail.com
