import { useState, useRef } from "react";
import { useInventory } from "../context/InventoryContext";
import PageHeader from "../components/PageHeader";
import JsBarcode from "jsbarcode";

export default function BarcodeGenerator() {
  const { products } = useInventory();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [format, setFormat] = useState("CODE128");
  const barcodeRef = useRef(null);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));
  const barcodeValue = selectedProduct ? selectedProduct.sku : customValue;

  const generateBarcode = () => {
    if (!barcodeValue || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, barcodeValue, {
        format: format,
        width: 2,
        height: 80,
        displayValue: true,
        font: "Inter, system-ui, sans-serif",
        fontSize: 14,
      });
    } catch (err) {
      console.error("Invalid barcode value for selected format", err);
    }
  };

  const handleGenerate = () => {
    generateBarcode();
  };

  const downloadBarcode = (type) => {
    if (!barcodeRef.current) return;
    const svg = barcodeRef.current;
    if (type === "svg") {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barcode-${barcodeValue || "custom"}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (type === "png") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgString = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `barcode-${barcodeValue || "custom"}.png`;
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <div>
      <PageHeader
        title="Barcode Generator"
        subtitle="Generate and download barcodes for products"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setCustomValue("");
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Select a product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or enter custom value</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Custom Value</label>
              <input
                type="text"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  setSelectedProductId("");
                }}
                placeholder="Enter barcode value..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Barcode Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CODE128">CODE128</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="CODE39">CODE39</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!barcodeValue}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Generate Barcode
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Preview</h3>
          <div className="flex flex-col items-center justify-center">
            {barcodeValue ? (
              <>
                <div className="rounded-lg border border-dashed border-slate-300 p-6">
                  <svg ref={barcodeRef} className="max-w-full" />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Value: <span className="font-mono font-medium text-slate-800">{barcodeValue}</span>
                </p>
                {selectedProduct && (
                  <p className="text-sm text-slate-500">
                    Product: <span className="font-medium text-slate-800">{selectedProduct.name}</span>
                  </p>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => downloadBarcode("svg")}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Download SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadBarcode("png")}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Download PNG
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <p>Select a product or enter a custom value to generate a barcode.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
