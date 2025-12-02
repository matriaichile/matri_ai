"use client";

import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, Sparkles, User, Briefcase, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
    const baseStyle = "px-8 py-3 transition-all duration-500 uppercase tracking-widest text-xs font-semibold border";
    const variants: Record<string, string> = {
      primary: "bg-rose-900 text-white border-rose-900 hover:bg-white hover:text-rose-900",
      outline: "bg-transparent text-rose-900 border-rose-900 hover:bg-rose-900 hover:text-white",
      light: "bg-white text-rose-900 border-white hover:bg-transparent hover:text-white",
      ghost: "border-transparent text-gray-600 hover:text-rose-900"
    };
    return (
      <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  return (
    <div className="font-sans text-gray-800 bg-[#FDFAF6] min-h-screen selection:bg-rose-200">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className={`text-2xl font-display tracking-[0.2em] ${scrolled ? 'text-rose-900' : 'text-rose-900 md:text-white'}`}>
            MATRI.AI
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#" className={`text-xs uppercase tracking-widest hover:text-rose-400 transition-colors ${scrolled ? 'text-gray-600' : 'text-white'}`}>Cómo funciona</Link>
            <Link href="#" className={`text-xs uppercase tracking-widest hover:text-rose-400 transition-colors ${scrolled ? 'text-gray-600' : 'text-white'}`}>Inspiración</Link>
            <Button variant={scrolled ? 'outline' : 'light'} className="ml-4">Login</Button>
          </div>

          <button className="md:hidden text-rose-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FDFAF6]"></div>
        </div>

        <div className="relative z-10 text-center px-4 animate-fade-in-up max-w-4xl mx-auto mt-20">
          <p className="text-white text-xs md:text-sm uppercase tracking-[0.3em] mb-4 drop-shadow-md">
            El futuro de la planificación nupcial
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight drop-shadow-lg">
            Curaduría <br/> Inteligente
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-white/90 mb-12 font-light">
            Conectamos emociones con los proveedores perfectos.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="group relative">
              <div className="absolute -inset-1 bg-white rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Link href="/register/user">
                <button className="relative w-64 bg-white/95 backdrop-blur-sm text-rose-900 px-8 py-6 shadow-xl hover:bg-white transition-all duration-300 border border-white">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-display tracking-widest text-sm">Soy Novio/a</span>
                    <span className="font-serif text-xs italic text-gray-500">Diseña tu día soñado</span>
                  </div>
                </button>
              </Link>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-rose-200 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Link href="/register/provider">
                <button className="relative w-64 bg-rose-900/90 backdrop-blur-sm text-white px-8 py-6 shadow-xl hover:bg-rose-900 transition-all duration-300 border border-rose-800">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-display tracking-widest text-sm">Soy Proveedor</span>
                    <span className="font-serif text-xs italic text-rose-200">Potencia tu negocio</span>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Value Proposition - Editorial Style */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-rose-500 text-xs uppercase tracking-[0.2em] block mb-3">Filosofía Matri.AI</span>
          <h2 className="font-serif text-4xl md:text-5xl text-gray-800 mb-6">
            Matchmaking <span className="italic text-rose-900">Artisanal</span>
          </h2>
          <div className="w-16 h-[1px] bg-rose-300 mx-auto"></div>
          <p className="mt-8 text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
            Olvídate de las listas interminables y los correos sin respuesta. Nuestra inteligencia artificial analiza tu estilo, presupuesto y sueños para presentarte únicamente a los 3 proveedores que nacieron para tu boda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="text-center group cursor-pointer">
            <div className="relative overflow-hidden mb-6 h-96 w-full">
              <Image 
                src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1887&auto=format&fit=crop" 
                alt="Estilo" 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[0.1]" 
              />
              <div className="absolute inset-0 bg-rose-900/0 group-hover:bg-rose-900/10 transition-colors duration-500"></div>
            </div>
            <h3 className="font-display text-lg mb-2">Estilo & Visión</h3>
            <p className="text-gray-500 font-light text-sm px-4">Un cuestionario visual tipo Vogue que entiende tus gustos mejor que Pinterest.</p>
          </div>

          {/* Card 2 */}
          <div className="text-center group cursor-pointer md:-mt-12">
            <div className="relative overflow-hidden mb-6 h-96 w-full">
              <Image 
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1887&auto=format&fit=crop" 
                alt="Match" 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[0.1]" 
              />
              <div className="absolute inset-0 bg-rose-900/0 group-hover:bg-rose-900/10 transition-colors duration-500"></div>
            </div>
            <h3 className="font-display text-lg mb-2">Curaduría IA</h3>
            <p className="text-gray-500 font-light text-sm px-4">Algoritmos que equilibran presupuesto y estética para encontrar el match perfecto.</p>
          </div>

          {/* Card 3 */}
          <div className="text-center group cursor-pointer">
            <div className="relative overflow-hidden mb-6 h-96 w-full">
              <Image 
                src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=1887&auto=format&fit=crop" 
                alt="Dashboard" 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 filter sepia-[0.1]" 
              />
              <div className="absolute inset-0 bg-rose-900/0 group-hover:bg-rose-900/10 transition-colors duration-500"></div>
            </div>
            <h3 className="font-display text-lg mb-2">Dashboard Nupcial</h3>
            <p className="text-gray-500 font-light text-sm px-4">Gestiona tus leads y proveedores en una interfaz limpia, minimalista y libre de estrés.</p>
          </div>
        </div>
      </section>

      {/* Split Section for Users & Vendors */}
      <section className="flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Bride/Groom */}
        <div className="flex-1 bg-white p-12 md:p-20 flex flex-col justify-center items-start border-r border-rose-50">
          <div className="flex items-center gap-3 mb-6 text-rose-400">
            <User size={20} />
            <span className="uppercase tracking-widest text-xs">Para Novios</span>
          </div>
          <h2 className="font-serif text-4xl text-gray-900 mb-6 leading-tight">
            Diseña una boda <br /> <span className="italic text-rose-900">Inolvidable</span>
          </h2>
          <ul className="space-y-4 mb-10 text-gray-600 font-light">
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-rose-300 mt-1 shrink-0" />
              <span>Wizard interactivo para definir tu estilo.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-rose-300 mt-1 shrink-0" />
              <span>Recomendaciones personalizadas (Top 3).</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={18} className="text-rose-300 mt-1 shrink-0" />
              <span>Gestión de presupuesto y timeline.</span>
            </li>
          </ul>
          <Link href="/register/user">
            <Button variant="primary">Comenzar Aventura</Button>
          </Link>
        </div>

        {/* Right Side - Vendors */}
        <div className="flex-1 bg-rose-50/50 p-12 md:p-20 flex flex-col justify-center items-start">
          <div className="flex items-center gap-3 mb-6 text-rose-900">
            <Briefcase size={20} />
            <span className="uppercase tracking-widest text-xs">Para Proveedores</span>
          </div>
          <h2 className="font-serif text-4xl text-gray-900 mb-6 leading-tight">
            Conecta con tus <br /> <span className="italic text-rose-900">Clientes Ideales</span>
          </h2>
          <ul className="space-y-4 mb-10 text-gray-600 font-light">
            <li className="flex items-start gap-3">
              <Sparkles size={18} className="text-rose-900 mt-1 shrink-0" />
              <span>Leads calificados y filtrados por presupuesto.</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles size={18} className="text-rose-900 mt-1 shrink-0" />
              <span>Calendario de disponibilidad inteligente.</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles size={18} className="text-rose-900 mt-1 shrink-0" />
              <span>Escaparate digital de alto impacto.</span>
            </li>
          </ul>
          <Link href="/register/provider">
            <Button variant="outline">Unirse como Proveedor</Button>
          </Link>
        </div>
      </section>

      {/* Aesthetic Banner / Footer Pre-amble */}
      <section className="relative py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 container mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl text-rose-900 mb-8">
            &quot;El lujo es la simplicidad.&quot;
          </h2>
          <p className="font-serif italic text-xl text-gray-500 mb-8">
            Empieza hoy a planificar el día más importante de tu vida.
          </p>
          <div className="flex justify-center gap-4">
             <div className="h-px w-20 bg-rose-300 self-center"></div>
             <Heart size={20} className="text-rose-400 fill-rose-100" />
             <div className="h-px w-20 bg-rose-300 self-center"></div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-rose-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-display tracking-[0.2em] text-rose-900">
            MATRI.AI
          </div>
          <div className="text-xs text-gray-400 tracking-widest uppercase">
            © 2025 Matri.AI • Santiago, Chile
          </div>
          <div className="flex gap-6 text-gray-400 hover:text-rose-900 transition-colors">
            <Link href="#" className="text-xs uppercase tracking-widest hover:underline">Instagram</Link>
            <Link href="#" className="text-xs uppercase tracking-widest hover:underline">Pinterest</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
