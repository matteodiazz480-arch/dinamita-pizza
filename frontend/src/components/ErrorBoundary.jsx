import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#181a20] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 font-bold text-lg">
              !
            </div>
            <h2 className="text-xl font-black text-white">
              Ocurrió un problema al cargar la página
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              No te preocupes, tus datos no se perdieron. Podés recargar la página o ir a la pantalla principal.
            </p>
            {this.state.error?.message && (
              <div className="text-[11px] font-mono text-gray-400 bg-black/40 p-2.5 rounded-xl border border-white/5 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Recargar página
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer border border-white/10"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
