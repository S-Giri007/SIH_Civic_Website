import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  BarChart3,
  MessageSquare,
  ChevronUp
} from 'lucide-react';
import { useScrollTo } from '../hooks/useScrollTo';

const LandingPage = () => {
  const { scrollToElement, scrollToTop } = useScrollTo();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const features = [
    {
      icon: FileText,
      title: 'Easy Reporting',
      description: 'Submit civic complaints with photos, location, and detailed descriptions in minutes.'
    },
    {
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Precise location mapping ensures issues are addressed at the right place.'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Track the progress of your complaints from submission to resolution.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Help build a better community by reporting issues that matter to everyone.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Issues Resolved' },
    { number: '24/7', label: 'Available Service' },
    { number: '2-5', label: 'Days Response Time' },
    { number: '95%', label: 'Satisfaction Rate' }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Report the Issue',
      description: 'Describe the problem, add photos, and mark the location on the map.',
      icon: FileText
    },
    {
      step: 2,
      title: 'Officer Assignment',
      description: 'Municipal officers review and assign the issue to the appropriate department.',
      icon: Shield
    },
    {
      step: 3,
      title: 'Resolution & Updates',
      description: 'Receive updates on progress and confirmation when the issue is resolved.',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CivicPortal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Shield className="w-4 h-4 mr-1" />
                Officer Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Building Better
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Communities Together
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            CivicPortal is your direct line to municipal services. Report civic issues, 
            track their progress, and help create positive change in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report"
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition duration-200 font-medium flex items-center justify-center text-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Report an Issue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button
              onClick={() => scrollToElement('how-it-works')}
              className="bg-white text-gray-700 px-8 py-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200 font-medium"
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CivicPortal?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes civic engagement simple, transparent, and effective for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to make your voice heard and create positive change in your community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-10 h-10 text-white" />  
                  </div>
                  <div className="absolute -top-2 -right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Vision Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-xl mb-8 max-w-4xl mx-auto opacity-90">
            We envision a future where every citizen has a direct, transparent, and efficient way to 
            communicate with their local government. CivicPortal bridges the gap between communities 
            and municipal services, fostering accountability, responsiveness, and civic engagement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="opacity-90">Real-time tracking and updates on all civic issues and their resolution progress.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="opacity-90">Empowering citizens to actively participate in improving their neighborhoods.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
              <p className="opacity-90">Streamlined processes that ensure faster response times and better outcomes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Joshua Samraj",
                role: "Local Resident",
                content: "CivicPortal made it so easy to report a pothole on my street. It was fixed within 3 days!",
                rating: 5
              },
              {
                name: "Giri raj",
                role: "Business Owner",
                content: "The transparency and quick response time have really improved our neighborhood's quality of life.",
                rating: 5
              },
              {
                name: "Hari ",
                role: "Community Leader",
                content: "This platform has revolutionized how we communicate with our local government. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of citizens who are actively improving their communities through CivicPortal.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition duration-200 font-medium text-lg"
          >
            <FileText className="w-5 h-5 mr-2" />
            Report Your First Issue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">CivicPortal</h3>
              </div>
              <p className="text-gray-400">
                Connecting communities with their local government for a better tomorrow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/report" className="hover:text-white transition-colors">Report Issue</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Officer Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Road & Transportation</li>
                <li>Water & Sanitation</li>
                <li>Electricity</li>
                <li>Waste Management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emergency: 911</li>
                <li>Non-Emergency: 311</li>
                <li>Email: support@civicportal.gov</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CivicPortal. All rights reserved. Built for better communities.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => scrollToTop()}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-110"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;