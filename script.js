class PixelArtGenerator {
	constructor() {
		this.currentColor = "#000000";
		this.currentAlpha = 255;
		this.canvas = document.getElementById("pixelCanvas");
		this.widthInput = document.getElementById("width");
		this.heightInput = document.getElementById("height");
		this.brushSizeInput = document.getElementById("brushSize");
		this.brushSizeValue = document.getElementById("brushSizeValue");
		this.generateBtn = document.getElementById("generate");
		this.colorPicker = document.getElementById("colorPicker");
		this.opacitySlider = document.getElementById("opacitySlider");
		this.opacityValue = document.getElementById("opacityValue");
		this.presetColors = document.querySelectorAll(".preset-color");
		this.exportBtn = document.getElementById("exportBtn");
		this.exportPngBtn = document.getElementById("exportPngBtn");
		this.clearBtn = document.getElementById("clearBtn");
		this.importFile = document.getElementById("importFile");
		this.gridWidth = 0;
		this.gridHeight = 0;

		this.init();
	}

	init() {
		this.generateBtn.addEventListener("click", () => this.generateGrid());
		this.colorPicker.addEventListener("change", (e) => this.setCurrentColor(e.target.value));

		// Opacity slider
		if (this.opacitySlider && this.opacityValue) {
			this.opacitySlider.addEventListener("input", (e) => {
				this.currentAlpha = parseInt(e.target.value);
				this.opacityValue.textContent = this.currentAlpha;
			});
		}

		// Brush size slider
		if (this.brushSizeInput && this.brushSizeValue) {
			this.brushSizeInput.addEventListener("input", (e) => {
				this.brushSizeValue.textContent = e.target.value;
			});
			// Set initial value
			this.brushSizeValue.textContent = this.brushSizeInput.value;
		}

		// Add event listeners to preset colors
		this.presetColors.forEach((preset) => {
			preset.addEventListener("click", () => {
				const color = preset.getAttribute("data-color");
				this.setCurrentColor(color);
				if (this.opacitySlider && this.opacityValue) {
					this.currentAlpha = 255;
					this.opacitySlider.value = 255;
					this.opacityValue.textContent = 255;
				}
			});
		});

		// Add export/import event listeners
		this.exportBtn.addEventListener("click", () => this.exportToCSV());
		this.exportPngBtn.addEventListener("click", () => this.exportToPNG());
		this.clearBtn.addEventListener("click", () => this.clearCanvas());
		this.importFile.addEventListener("change", (e) => this.importFromCSV(e));

		// Add window resize listener with debouncing
		let resizeTimeout;
		window.addEventListener("resize", () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				this.resizeGrid();
			}, 250); // Debounce resize for 250ms
		});

		// Generate initial grid
		this.generateGrid();
		this.setActivePreset(this.currentColor);
		if (this.opacitySlider && this.opacityValue) {
			this.opacitySlider.value = this.currentAlpha;
			this.opacityValue.textContent = this.currentAlpha;
		}
	}

	generateGrid() {
		const width = parseInt(this.widthInput.value);
		const height = parseInt(this.heightInput.value);

		if (width < 1 || height < 1 || width > 50 || height > 50) {
			alert("Please enter valid dimensions (1-50)");
			return;
		}

		// Store grid dimensions
		this.gridWidth = width;
		this.gridHeight = height;

		// Clear existing grid
		this.canvas.innerHTML = "";

		const containerWidth = this.canvas.parentElement.clientWidth - 40;
		const containerHeight = this.canvas.parentElement.clientHeight - 40;
		const totalGapWidth = (width - 1) * 1;
		const totalGapHeight = (height - 1) * 1;
		const borderWidth = 4;
		const borderHeight = 4;
		const availableWidth = containerWidth - totalGapWidth - borderWidth;
		const availableHeight = containerHeight - totalGapHeight - borderHeight;
		const maxPixelWidth = Math.floor(availableWidth / width);
		const maxPixelHeight = Math.floor(availableHeight / height);
		let pixelSize = Math.min(maxPixelWidth, maxPixelHeight);
		if (width > 30 || height > 30) {
			pixelSize = Math.max(pixelSize, 4);
		} else {
			pixelSize = Math.max(pixelSize, 8);
		}
		const finalPixelSize = pixelSize;
		this.canvas.style.gridTemplateColumns = `repeat(${width}, ${finalPixelSize}px)`;
		this.canvas.style.gridTemplateRows = `repeat(${height}, ${finalPixelSize}px)`;

		// Create pixels, each wrapped in a .pixel-bg div for per-pixel checkered background
		for (let i = 0; i < width * height; i++) {
			const pixelBg = document.createElement("div");
			pixelBg.className = "pixel-bg";
			pixelBg.style.width = `${finalPixelSize}px`;
			pixelBg.style.height = `${finalPixelSize}px`;

			const pixel = document.createElement("div");
			pixel.className = "pixel";
			pixel.style.width = "100%";
			pixel.style.height = "100%";
			pixel.dataset.index = i;
			pixel.style.backgroundColor = "transparent";

			pixel.addEventListener("click", () => this.paintWithBrush(i));
			pixel.addEventListener("mousedown", () => {
				this.isDrawing = true;
				this.paintWithBrush(i);
			});
			pixel.addEventListener("mouseenter", () => {
				if (this.isDrawing) {
					this.paintWithBrush(i);
				}
			});

			pixelBg.appendChild(pixel);
			this.canvas.appendChild(pixelBg);
		}

		// Add mouse up event to stop drawing
		document.addEventListener("mouseup", () => {
			this.isDrawing = false;
		});
	}

	paintWithBrush(centerIndex) {
		const brushSize = parseInt(this.brushSizeInput.value);
		const centerRow = Math.floor(centerIndex / this.gridWidth);
		const centerCol = centerIndex % this.gridWidth;

		// Use actual brush size as radius for circular brush
		const radius = brushSize - 1; // Brush size 1 = radius 0, size 2 = radius 1, etc.

		for (let row = centerRow - radius; row <= centerRow + radius; row++) {
			for (let col = centerCol - radius; col <= centerCol + radius; col++) {
				if (row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth) {
					// Calculate distance from center for circular brush
					const deltaRow = row - centerRow;
					const deltaCol = col - centerCol;
					const distance = Math.sqrt(deltaRow * deltaRow + deltaCol * deltaCol);

					// Only paint if within the circular brush radius
					if (distance <= radius + 0.5) {
						// Add 0.5 for better circular approximation
						const pixelIndex = row * this.gridWidth + col;
						const pixel = this.canvas.children[pixelIndex];
						if (pixel) {
							this.paintPixel(pixel);
						}
					}
				}
			}
		}
	}

	paintPixel(pixel) {
		// Compose color with alpha
		let color = this.currentColor;
		let alpha = this.currentAlpha;
		// If color is hex, add alpha
		if (color.startsWith("#")) {
			let hex = color.replace("#", "");
			if (hex.length === 3)
				hex = hex
					.split("")
					.map((x) => x + x)
					.join("");
			if (hex.length === 6) hex += alpha.toString(16).padStart(2, "0");
			else if (hex.length === 8) hex = hex.slice(0, 6) + alpha.toString(16).padStart(2, "0");
			color = "#" + hex;
		} else if (color.startsWith("rgb")) {
			// If rgb/rgba, convert to rgba with alpha
			let match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
			if (match) {
				const r = parseInt(match[1]);
				const g = parseInt(match[2]);
				const b = parseInt(match[3]);
				color = `rgba(${r},${g},${b},${(alpha / 255).toFixed(3)})`;
			}
		}
		pixel.children[0].style.backgroundColor = color;
	}

	setCurrentColor(color) {
		this.currentColor = color;
		this.colorPicker.value = color;
		this.setActivePreset(color);
		// Do not reset opacity here, only on preset click
	}

	setActivePreset(color) {
		this.presetColors.forEach((preset) => {
			preset.classList.remove("active");
			if (preset.getAttribute("data-color") === color) {
				preset.classList.add("active");
			}
		});
	}

	// Save current pixel colors
	savePixelColors() {
		const colors = [];
		if (this.canvas.children.length > 0) {
			for (let i = 0; i < this.canvas.children.length; i++) {
				const pixel = this.canvas.children[i].children[0]; // Get the actual pixel div
				colors.push(pixel.style.backgroundColor || "white");
			}
		}
		return colors;
	}

	// Restore pixel colors after resize
	restorePixelColors(colors) {
		if (colors && colors.length === this.canvas.children.length) {
			for (let i = 0; i < this.canvas.children.length; i++) {
				const pixel = this.canvas.children[i].children[0]; // Get the actual pixel div
				pixel.style.backgroundColor = colors[i];
			}
		}
	}

	// Resize grid while preserving artwork
	resizeGrid() {
		// Only resize if we have a grid
		if (this.gridWidth === 0 || this.gridHeight === 0) {
			return;
		}

		// Save current pixel colors
		const savedColors = this.savePixelColors();

		// Regenerate grid with new size calculations
		this.regenerateGridLayout();

		// Restore the saved colors
		this.restorePixelColors(savedColors);
	}

	// Regenerate just the grid layout without clearing colors
	regenerateGridLayout() {
		const width = this.gridWidth;
		const height = this.gridHeight;

		// Calculate pixel size based on available space (same logic as generateGrid)
		const containerWidth = this.canvas.parentElement.clientWidth - 40;
		const containerHeight = this.canvas.parentElement.clientHeight - 40;

		const totalGapWidth = (width - 1) * 1;
		const totalGapHeight = (height - 1) * 1;
		const borderWidth = 4;
		const borderHeight = 4;

		const availableWidth = containerWidth - totalGapWidth - borderWidth;
		const availableHeight = containerHeight - totalGapHeight - borderHeight;

		const maxPixelWidth = Math.floor(availableWidth / width);
		const maxPixelHeight = Math.floor(availableHeight / height);

		let pixelSize = Math.min(maxPixelWidth, maxPixelHeight);

		if (width > 30 || height > 30) {
			pixelSize = Math.max(pixelSize, 4);
		} else {
			pixelSize = Math.max(pixelSize, 8);
		}

		const finalPixelSize = pixelSize;

		// Update grid layout
		this.canvas.style.gridTemplateColumns = `repeat(${width}, ${finalPixelSize}px)`;
		this.canvas.style.gridTemplateRows = `repeat(${height}, ${finalPixelSize}px)`;

		// Update pixel sizes
		for (let i = 0; i < this.canvas.children.length; i++) {
			const pixel = this.canvas.children[i];
			pixel.style.width = `${finalPixelSize}px`;
			pixel.style.height = `${finalPixelSize}px`;
		}
	}

	// Convert any color (hex, rgb, rgba) to hex with alpha (8-digit)
	rgbToHex(color) {
		if (!color || color === "white" || color === "" || color === "transparent") {
			return "#00000000";
		}
		if (color.startsWith("#")) {
			// Normalize to 8-digit hex
			let hex = color.replace("#", "");
			if (hex.length === 3) {
				hex =
					hex
						.split("")
						.map((x) => x + x)
						.join("") + "ff";
			} else if (hex.length === 4) {
				hex = hex
					.split("")
					.map((x) => x + x)
					.join("");
			} else if (hex.length === 6) {
				hex = hex + "ff";
			} else if (hex.length === 8) {
				// already 8
			} else {
				return "#00000000";
			}
			return "#" + hex.toLowerCase();
		}
		// Handle rgb/rgba
		let match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		if (match) {
			const r = parseInt(match[1]);
			const g = parseInt(match[2]);
			const b = parseInt(match[3]);
			let a = 255;
			if (typeof match[4] !== "undefined") {
				a = Math.round(parseFloat(match[4]) * 255);
			}
			return (
				"#" +
				[r, g, b, a]
					.map((x, i) => (i < 3 ? x : a).toString(16).padStart(2, "0"))
					.join("")
					.toLowerCase()
			);
		}
		return "#00000000";
	}

	// Compress hex: #rrggbbaa -> #rgb, #rgba, #rrggbb, or #rrggbbaa as appropriate
	compressHex(hex) {
		hex = hex.replace("#", "");
		if (hex.length === 8) {
			// If alpha is ff, compress to 6 or 3
			if (hex.slice(6) === "ff") {
				hex = hex.slice(0, 6);
			}
		}
		if (hex.length === 6) {
			// Compress to 3 if possible
			if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
				return "#" + hex[0] + hex[2] + hex[4];
			}
			return "#" + hex;
		}
		if (hex.length === 8) {
			// Compress to 4 if possible
			if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5] && hex[6] === hex[7]) {
				return "#" + hex[0] + hex[2] + hex[4] + hex[6];
			}
			return "#" + hex;
		}
		if (hex.length === 4) {
			return "#" + hex;
		}
		if (hex.length === 3) {
			return "#" + hex;
		}
		return "#000";
	}

	// Export pixel art to CSV (with alpha, compressed hex)
	exportToCSV() {
		if (this.gridWidth === 0 || this.gridHeight === 0) {
			alert("No grid to export!");
			return;
		}

		const csvData = [];
		csvData.push(`# Pixel Art Export - ${this.gridWidth}x${this.gridHeight}`);
		csvData.push(`# Width: ${this.gridWidth}, Height: ${this.gridHeight}`);

		for (let row = 0; row < this.gridHeight; row++) {
			const rowData = [];
			for (let col = 0; col < this.gridWidth; col++) {
				const pixelIndex = row * this.gridWidth + col;
				const pixel = this.canvas.children[pixelIndex].children[0];
				const color = pixel ? pixel.style.backgroundColor : "transparent";
				const hexColor = this.rgbToHex(color);
				const compressed = this.compressHex(hexColor);
				rowData.push(compressed);
			}
			csvData.push(rowData.join(","));
		}

		const csvContent = csvData.join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `pixel-art-${this.gridWidth}x${this.gridHeight}-${new Date().toISOString().slice(0, 10)}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}

	// Import pixel art from CSV (supports 3, 4, 6, 8 digit hex)
	importFromCSV(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const csvContent = e.target.result;
				// Handle different line endings
				const allLines = csvContent.split(/\r?\n|\r/);
				const lines = allLines.map((line) => line.trim()).filter((line) => line && !line.startsWith("# "));

				if (lines.length === 0) {
					alert("No valid data found in CSV file!");
					return;
				}

				// Parse dimensions from data
				const height = lines.length;
				const width = lines[0].split(",").length;

				// Validate hex codes (3, 4, 6, 8 digits)
				const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
				for (let line of lines) {
					const colors = line.split(",");
					for (let color of colors) {
						if (!hexPattern.test(color.trim())) {
							alert(`Invalid hex color found: ${color.trim()}`);
							return;
						}
					}
				}

				// Update grid dimensions
				this.widthInput.value = width;
				this.heightInput.value = height;

				// Generate new grid
				this.generateGrid();

				// Apply imported colors immediately
				for (let row = 0; row < height; row++) {
					const colors = lines[row].split(",");
					for (let col = 0; col < width; col++) {
						const pixelIndex = row * width + col;
						const pixel = this.canvas.children[pixelIndex].children[0];
						if (pixel && colors[col]) {
							pixel.style.backgroundColor = colors[col].trim();
						}
					}
				}

				setTimeout(() => {
					alert(`Successfully imported ${width}x${height} pixel art!`);
				}, 100);
			} catch (error) {
				alert("Error reading CSV file: " + error.message);
			}
		};
		reader.readAsText(file);
		event.target.value = "";
	}

	// Clear all pixels to transparent
	clearCanvas() {
		if (confirm("Are you sure you want to clear all pixels? This cannot be undone.")) {
			for (let i = 0; i < this.canvas.children.length; i++) {
				const pixel = this.canvas.children[i].children[0];
				pixel.style.backgroundColor = "transparent";
			}
		}
	}

	// Fill all pixels with current color
	fillCanvas() {
		for (let i = 0; i < this.canvas.children.length; i++) {
			const pixel = this.canvas.children[i].children[0];
			pixel.style.backgroundColor = this.currentColor;
		}
	}

	// Export pixel art to PNG (with alpha)
	exportToPNG() {
		if (this.gridWidth === 0 || this.gridHeight === 0) {
			alert("No grid to export!");
			return;
		}

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const pixelSize = 10;
		canvas.width = this.gridWidth * pixelSize;
		canvas.height = this.gridHeight * pixelSize;

		for (let row = 0; row < this.gridHeight; row++) {
			for (let col = 0; col < this.gridWidth; col++) {
				const pixelIndex = row * this.gridWidth + col;
				const pixel = this.canvas.children[pixelIndex].children[0];
				const color = pixel ? pixel.style.backgroundColor : "transparent";
				// Convert to rgba
				let hex = this.rgbToHex(color);
				let rgba = this.hexToRgba(hex);
				ctx.fillStyle = rgba;
				ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
			}
		}

		canvas.toBlob((blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `pixel-art-${this.gridWidth}x${this.gridHeight}-${new Date().toISOString().slice(0, 10)}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, "image/png");
	}

	// Convert 8-digit hex to rgba string
	hexToRgba(hex) {
		hex = hex.replace("#", "");
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "ff";
		} else if (hex.length === 4) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
		} else if (hex.length === 6) {
			hex = hex + "ff";
		}
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const a = parseInt(hex.slice(6, 8), 16) / 255;
		return `rgba(${r},${g},${b},${a})`;
	}
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	const app = new PixelArtGenerator();
	// Add fill button if not present
	let fillBtn = document.getElementById("fillBtn");
	fillBtn.addEventListener("click", () => app.fillCanvas());
});
