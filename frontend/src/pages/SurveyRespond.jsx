import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import { surveyService } from "../services/surveyService";
import { responseService } from "../services/responseService";
import { responseSchema } from "../schemas/responseSchemas";
import FormInput from "../components/common/FormInput";
import { Skeleton } from "../components/common/Skeleton";
import Alert from "../components/common/Alert";
import { checkSurveyAccess, validateResponseData, formatResponseDataForAPI, getErrorMessage } from "../utils";

const SurveyRespond = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      respondentEmail: "",
      answers: {},
    },
  });

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await surveyService.getSurvey(id);

      // Check survey access using utility
      const access = checkSurveyAccess(data.data);
      if (!access.accessible) {
        setError(access.reason);
        setSurvey(null);
        setLoading(false);
        return;
      }

      setSurvey(data.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar la encuesta"));
      setSurvey(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("📝 [RESPONSE] Starting submission...");
      setError("");

      // Get required questions
      const requiredQuestions = survey.questions
        .filter(q => q.required)
        .map(q => q._id);

      // Validate using utility
      const validation = validateResponseData(data, requiredQuestions);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      // Format for API using utility
      const payload = formatResponseDataForAPI(data);

      console.log("🚀 [RESPONSE] Sending to API:", JSON.stringify(payload, null, 2));

      await responseService.submitResponse(id, payload);

      console.log("✅ [RESPONSE] Success!");

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("❌ [RESPONSE] Error:", err);
      setError(getErrorMessage(err, "Error al enviar respuesta"));
    }
  };

  const renderQuestion = (question, index) => {
    const questionId = question._id;

    switch (question.type) {
      case "text":
        return (
          <Controller
            name={`answers.${questionId}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <textarea
                {...field}
                className="input-field"
                rows="4"
                placeholder="Escribe tu respuesta aquí..."
              />
            )}
          />
        );

      case "multiple":
        return (
          <Controller
            name={`answers.${questionId}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      value={option}
                      checked={field.value === option}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-4 h-4 text-primary-600 mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          />
        );

      case "scale":
        return (
          <Controller
            name={`answers.${questionId}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>1 (Muy malo)</span>
                  <span>10 (Excelente)</span>
                </div>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => field.onChange(num)}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                        field.value === num
                          ? "bg-primary-500 text-white scale-110 shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {field.value
                    ? `Seleccionado: ${field.value}`
                    : "Selecciona una puntuación"}
                </div>
              </div>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={`answers.${questionId}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <input {...field} type="date" className="input-field" />
            )}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header Skeleton */}
          <div className="bg-white rounded-t-2xl shadow-2xl p-8 border-b-4 border-primary-500">
            <div className="text-center space-y-4 animate-pulse">
              <div className="text-6xl mb-4">⚙️</div>
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center gap-6 animate-pulse">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-b-2xl shadow-2xl p-8 space-y-8">
            {/* Email Skeleton */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-3 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Questions Skeleton */}
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="pb-6 border-b border-gray-200 space-y-4 animate-pulse"
                >
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              ))}
            </div>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={80} />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Gracias por tu respuesta!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu participación ha sido registrada exitosamente.
          </p>
          <div className="text-sm text-gray-500">
            Redirigiendo en 3 segundos...
          </div>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={80} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Encuesta no disponible
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-t-2xl shadow-2xl p-8 border-b-4 border-primary-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-gray-600 text-lg">{survey.description}</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <span>📝 {survey.questions?.length} preguntas</span>
              <span>👤 Requiere email</span>
              {survey.settings?.maxResponses && (
                <span>
                  📊 {survey.responseCount || 0} /{" "}
                  {survey.settings.maxResponses} respuestas
                </span>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-b-2xl shadow-2xl p-8"
        >
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* REQUIRED EMAIL */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-blue-600" />
              Tu Email (Requerido)
            </h3>
            <FormInput
              type="email"
              placeholder="tu-email@uce.edu.ec"
              {...register("respondentEmail")}
              error={errors.respondentEmail?.message}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-gray-600">
              ℹ️ Usamos tu email para evitar respuestas duplicadas. Tu
              información es privada.
            </p>
          </div>

          <div className="space-y-8">
            {survey.questions?.map((question, index) => (
              <div
                key={question._id}
                className="pb-6 border-b border-gray-200 last:border-b-0"
              >
                <label className="block mb-4">
                  <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-primary-600">{index + 1}.</span>
                    {question.text}
                    {question.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </span>
                </label>
                {renderQuestion(question, index)}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <span className="text-red-500">*</span> Campos obligatorios
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin">⚙️</div>
                  Enviando...
                </span>
              ) : (
                "✓ Enviar Respuesta"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-white text-sm opacity-80">
          <p>Universidad Central del Ecuador - Sistema de Encuestas</p>
        </div>
      </div>
    </div>
  );
};

export default SurveyRespond;